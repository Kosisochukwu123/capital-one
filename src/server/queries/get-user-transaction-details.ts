
import { db } from "@/lib/db";

export async function getUserTransactionDetails(
  transactionId: string,
  userId: string
) {
  const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },

    select: {
      id: true,
      reference: true,
      type: true,
      status: true,
      amount: true,
      title: true,
      description: true,
      category: true,
      memo: true,
      statusReason: true,
      transactionDate: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
      failedAt: true,

      btcEnabled: true,
      btcAmount: true,
      btcProgressPercent: true,

      account: {
        select: {
          id: true,
          type: true,
          accountNumber: true,
          currency: true,
        },
      },
    },
  });

  if (!transaction) {
    return null;
  }

  const transfer = await db.transfer.findFirst({
    where: {
      reference: transaction.reference,
      userId,
    },

    select: {
      id: true,
      recipientName: true,
      recipientAccountNumber: true,
      recipientBankName: true,
      currency: true,
      status: true,
      failureReason: true,
    },
  });

  return {
    id: transaction.id,
    reference: transaction.reference,
    type: transaction.type,
    status: transaction.status,
    amount: transaction.amount.toNumber(),
    title: transaction.title,
    description: transaction.description,
    category: transaction.category,
    memo: transaction.memo,
    statusReason: transaction.statusReason,
    transactionDate: transaction.transactionDate,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    completedAt: transaction.completedAt,
    failedAt: transaction.failedAt,

    // Never expose disabled BTC values to customers.
    btcEnabled: transaction.btcEnabled,
    btcAmount:
      transaction.btcEnabled && transaction.btcAmount !== null
        ? transaction.btcAmount.toString()
        : null,
    btcProgressPercent:
      transaction.btcEnabled
        ? transaction.btcProgressPercent
        : null,

    account: {
      id: transaction.account.id,
      type: transaction.account.type,
      accountNumber: transaction.account.accountNumber,
      currency: transaction.account.currency,
    },

    transfer: transfer
      ? {
          id: transfer.id,
          recipientName: transfer.recipientName,
          recipientAccountNumber: transfer.recipientAccountNumber,
          recipientBankName: transfer.recipientBankName,
          currency: transfer.currency,
          status: transfer.status,
        }
      : null,
  };
}
