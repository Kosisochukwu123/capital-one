"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  submitTransferSchema,
  type SubmitTransferInput,
} from "@/lib/validations/submit-transfer";
import { createTransfer } from "@/server/services/create-transfer";

export type SubmitTransferResult =
  | {
      success: true;
      transactionId: string;
      transferId: string;
      reference: string;
    }
  | {
      success: false;
      error: string;
      requiresPinSetup?: boolean;
    };

export async function submitTransferAction(
  values: SubmitTransferInput
): Promise<SubmitTransferResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const parsed = submitTransferSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid transfer information.",
    };
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      status: true,
      requiresPinSetup: true,
      securitySettings: {
        select: {
          transactionPinHash: true,
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return {
      success: false,
      error: "Your account is not available.",
    };
  }

  if (
    user.requiresPinSetup ||
    !user.securitySettings?.transactionPinHash
  ) {
    return {
      success: false,
      error:
        "Set up your transaction PIN before making a transfer.",
      requiresPinSetup: true,
    };
  }

  const pinMatches = await bcrypt.compare(
    parsed.data.pin,
    user.securitySettings.transactionPinHash
  );

  if (!pinMatches) {
    return {
      success: false,
      error: "Incorrect transaction PIN.",
    };
  }

  try {
    const result = await createTransfer(user.id, {
      fromAccountId: parsed.data.fromAccountId,
      recipientName: parsed.data.recipientName,
      recipientAccountNumber:
        parsed.data.recipientAccountNumber,
      recipientBankName:
        parsed.data.recipientBankName,
      amount: parsed.data.amount,
      memo: parsed.data.memo,
    });

    if (!result.success) {
      return result;
    }

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/payments");

    return {
      success: true,
      transactionId: result.transactionId,
      transferId: result.transferId,
      reference: result.reference,
    };
  } catch (error) {
    console.error(
      "Transfer submission error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "TRANSFER_DEBIT_FAILED"
    ) {
      return {
        success: false,
        error:
          "The transfer could not be completed. Check your balance and account status.",
      };
    }

    return {
      success: false,
      error:
        "Unable to submit the transfer. Please try again.",
    };
  }
}