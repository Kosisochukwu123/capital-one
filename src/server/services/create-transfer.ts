import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { generateTransactionReference } from "@/lib/banking/identifiers";
import {
  createTransferSchema,
  type CreateTransferInput,
} from "@/lib/validations/transfer";

export type CreateTransferResult =
  | {
      success: true;
      transferId: string;
      transactionId: string;
      reference: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createTransfer(
  userId: string,
  input: CreateTransferInput
): Promise<CreateTransferResult> {
  const parsed = createTransferSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid transfer information.",
    };
  }

  const data = parsed.data;

  const account = await db.account.findFirst({
    where: {
      id: data.fromAccountId,
      userId,
    },
    select: {
      id: true,
      balance: true,
      currency: true,
      status: true,
      transferPermission: true,
    },
  });

  if (!account) {
    return {
      success: false,
      error: "Account could not be found.",
    };
  }

  if (account.status !== "ACTIVE") {
    return {
      success: false,
      error: "This account cannot make transfers.",
    };
  }

  if (account.transferPermission !== "ENABLED") {
    return {
      success: false,
      error:
        "Transfers are currently unavailable for this account.",
    };
  }

  const amount = new Prisma.Decimal(data.amount);

  if (account.balance.lessThan(amount)) {
    return {
      success: false,
      error: "Insufficient balance.",
    };
  }

  let reference = generateTransactionReference();

  while (
    await db.transaction.findUnique({
      where: {
        reference,
      },
      select: {
        id: true,
      },
    })
  ) {
    reference = generateTransactionReference();
  }

  const result = await db.$transaction(async (tx) => {
    const debitResult = await tx.account.updateMany({
      where: {
        id: account.id,
        userId,
        status: "ACTIVE",
        transferPermission: "ENABLED",
        balance: {
          gte: amount,
        },
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    if (debitResult.count !== 1) {
      throw new Error("TRANSFER_DEBIT_FAILED");
    }

    const transfer = await tx.transfer.create({
      data: {
        userId,
        reference,
        fromAccountId: account.id,
        recipientName: data.recipientName.trim(),
        recipientAccountNumber:
          data.recipientAccountNumber,
        recipientBankName:
          data.recipientBankName.trim(),
        amount,
        currency: account.currency,
        memo: data.memo?.trim() || null,
        status: "PENDING",
      },
    });

    const transaction =
      await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          reference,
          type: "DEBIT",
          status: "PENDING",
          amount,
          title: `Transfer to ${data.recipientName}`,
          description: `Transfer to ${data.recipientName}`,
          category: "Transfer",
          memo: data.memo?.trim() || null,
          statusReason:
            "Your transfer is being processed.",
          transactionDate: new Date(),
        },
      });

    await tx.activityLog.create({
      data: {
        userId,
        action: "TRANSFER_CREATED",
        description:
          `Transfer ${reference} created.`,
      },
    });

    return {
      transferId: transfer.id,
      transactionId: transaction.id,
      reference,
    };
  });

  return {
    success: true,
    ...result,
  };
}