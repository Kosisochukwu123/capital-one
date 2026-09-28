import { db } from "@/lib/db";

export async function getAdminDashboardData() {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalAccounts,
    pendingTransactions,
    totalTransactions,
    recentUsers,
  ] = await Promise.all([
    db.user.count({
      where: {
        role: "USER",
      },
    }),

    db.user.count({
      where: {
        role: "USER",
        status: "ACTIVE",
      },
    }),

    db.user.count({
      where: {
        role: "USER",
        status: "SUSPENDED",
      },
    }),

    db.account.count({
      where: {
        user: {
          role: "USER",
        },
      },
    }),

    db.transaction.count({
      where: {
        status: "PENDING",
      },
    }),

    db.transaction.count(),

    db.user.findMany({
      where: {
        role: "USER",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        email: true,
        customerId: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        accounts: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalAccounts,
    pendingTransactions,
    totalTransactions,

    recentUsers: recentUsers.map((user) => ({
      id: user.id,
      email: user.email,
      customerId: user.customerId,
      status: user.status,
      createdAt: user.createdAt,
      fullName: user.profile
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.email,
      totalBalance: user.accounts.reduce(
        (total, account) =>
          total + account.balance.toNumber(),
        0
      ),
    })),
  };
}