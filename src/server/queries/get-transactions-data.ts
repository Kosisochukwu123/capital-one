import { db } from "@/lib/db";

export async function getTransactionsData(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },

      accounts: {
        where: {
          status: {
            not: "CLOSED",
          },
        },
        orderBy: {
          openedAt: "asc",
        },
        select: {
          id: true,
          type: true,
          accountNumber: true,
          currency: true,
          balance: true,
          status: true,
        },
      },

      transactions: {
        orderBy: {
          transactionDate: "desc",
        },
        select: {
          id: true,
          accountId: true,
          reference: true,
          type: true,
          status: true,
          amount: true,
          title: true,
          description: true,
          category: true,
          memo: true,
          transactionDate: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    firstName: user.profile?.firstName ?? "Customer",
    lastName: user.profile?.lastName ?? "",

    accounts: user.accounts.map((account) => ({
      id: account.id,
      type: account.type,
      accountNumber: account.accountNumber,
      currency: account.currency,
      balance: account.balance.toNumber(),
      status: account.status,
    })),

    transactions: user.transactions.map((transaction) => ({
      id: transaction.id,
      accountId: transaction.accountId,
      reference: transaction.reference,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount.toNumber(),
      title: transaction.title,
      description: transaction.description,
      category: transaction.category,
      memo: transaction.memo,
      transactionDate: transaction.transactionDate,
      createdAt: transaction.createdAt,
    })),
  };
}