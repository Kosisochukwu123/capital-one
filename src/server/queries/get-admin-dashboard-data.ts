import type { UserRole } from "@prisma/client";

import { db } from "@/lib/db";

interface AdminDashboardUser {
    id: string;
    role: UserRole;
}

export async function getAdminDashboardData(
    admin: AdminDashboardUser
) {
    const customerWhere =
        admin.role === "SUPER_ADMIN"
            ? {
                  role: "USER" as const,
              }
            : {
                  role: "USER" as const,
                  accountManagerId: admin.id,
              };

    const accountWhere =
        admin.role === "SUPER_ADMIN"
            ? {
                  user: {
                      role: "USER" as const,
                  },
              }
            : {
                  user: {
                      role: "USER" as const,
                      accountManagerId: admin.id,
                  },
              };

    const transactionWhere =
        admin.role === "SUPER_ADMIN"
            ? {}
            : {
                  user: {
                      role: "USER" as const,
                      accountManagerId: admin.id,
                  },
              };

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
            where: customerWhere,
        }),

        db.user.count({
            where: {
                ...customerWhere,
                status: "ACTIVE",
            },
        }),

        db.user.count({
            where: {
                ...customerWhere,
                status: "SUSPENDED",
            },
        }),

        db.account.count({
            where: accountWhere,
        }),

        db.transaction.count({
            where: {
                ...transactionWhere,
                status: "PENDING",
            },
        }),

        db.transaction.count({
            where: transactionWhere,
        }),

        db.user.findMany({
            where: customerWhere,

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

        recentUsers: recentUsers.map(
            (user) => ({
                id: user.id,
                email: user.email,
                customerId:
                    user.customerId,
                status: user.status,
                createdAt:
                    user.createdAt,

                fullName: user.profile
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.email,

                totalBalance:
                    user.accounts.reduce(
                        (
                            total,
                            account
                        ) =>
                            total +
                            account.balance.toNumber(),
                        0
                    ),
            })
        ),
    };
}