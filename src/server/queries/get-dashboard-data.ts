import { db } from "@/lib/db";

export async function getDashboardData(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      customerId: true,

      profile: {
        select: {
          firstName: true,
          middleName: true,
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
          transferPermission: true,
          openedAt: true,
        },
      },

      transactions: {
        orderBy: {
          transactionDate: "desc",
        },
        take: 3,
        select: {
          id: true,
          reference: true,
          type: true,
          status: true,
          amount: true,
          title: true,
          description: true,
          category: true,
          transactionDate: true,
          accountId: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    customerId: user.customerId,
    firstName: user.profile?.firstName ?? "Customer",
    middleName: user.profile?.middleName ?? null,
    lastName: user.profile?.lastName ?? "",

    accounts: user.accounts.map((account) => ({
      id: account.id,
      type: account.type,
      accountNumber: account.accountNumber,
      currency: account.currency,
      balance: account.balance.toNumber(),
      status: account.status,
      transferPermission: account.transferPermission,
      openedAt: account.openedAt,
    })),

    transactions: user.transactions.map((transaction) => ({
      id: transaction.id,
      reference: transaction.reference,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount.toNumber(),
      title: transaction.title,
      description: transaction.description,
      category: transaction.category,
      transactionDate: transaction.transactionDate,
      accountId: transaction.accountId,
    })),
  };
}