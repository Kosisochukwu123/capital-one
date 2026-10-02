import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";

type AdminUser = {
    id: string;
    role: UserRole;
};

export async function getAdminUsers(
    admin: AdminUser
) {
    const users = await db.user.findMany({
        where: {
            role: "USER",

            ...(admin.role === "ADMIN"
                ? {
                      accountManagerId: admin.id,
                  }
                : {}),
        },

        orderBy: {
            createdAt: "desc",
        },

        select: {
            id: true,
            email: true,
            customerId: true,
            status: true,
            createdAt: true,

            profile: {
                select: {
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    phone: true,
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
                    balance: true,
                    currency: true,
                    status: true,
                },
            },

            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    });

    return users.map((user) => ({
        id: user.id,
        email: user.email,
        customerId: user.customerId,
        status: user.status,
        createdAt: user.createdAt,

        firstName:
            user.profile?.firstName ?? "",

        middleName:
            user.profile?.middleName ?? "",

        lastName:
            user.profile?.lastName ?? "",

        phone:
            user.profile?.phone ?? "",

        fullName: user.profile
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : user.email,

        transactionCount:
            user._count.transactions,

        accounts: user.accounts.map(
            (account) => ({
                id: account.id,
                type: account.type,
                accountNumber:
                    account.accountNumber,
                balance:
                    account.balance.toNumber(),
                currency: account.currency,
                status: account.status,
            })
        ),

        totalBalance:
            user.accounts.reduce(
                (total, account) =>
                    total +
                    account.balance.toNumber(),
                0
            ),
    }));
}