import { db } from "@/lib/db";

export async function getAccountDetails(
  userId: string,
  accountId: string
) {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
      status: {
        not: "CLOSED",
      },
    },
    select: {
      id: true,
      type: true,
      accountNumber: true,
      currency: true,
      balance: true,
      status: true,
      transferPermission: true,
      openedAt: true,

      transactions: {
        orderBy: {
          transactionDate: "desc",
        },
        take: 10,
        select: {
          id: true,
          reference: true,
          type: true,
          status: true,
          amount: true,
          title: true,
          description: true,
          transactionDate: true,
        },
      },
    },
  });

  if (!account) {
    return null;
  }

  return {
    id: account.id,
    type: account.type,
    accountNumber: account.accountNumber,
    currency: account.currency,
    balance: account.balance.toNumber(),
    status: account.status,
    transferPermission:
      account.transferPermission,
    openedAt: account.openedAt,

    transactions: account.transactions.map(
      (transaction) => ({
        id: transaction.id,
        reference: transaction.reference,
        type: transaction.type,
        status: transaction.status,
        amount:
          transaction.amount.toNumber(),
        title: transaction.title,
        description:
          transaction.description,
        transactionDate:
          transaction.transactionDate,
      })
    ),
  };
}