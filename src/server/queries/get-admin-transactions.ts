import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";

type AdminUser = {
    id: string;
    role: UserRole;
};

export async function getAdminTransactions(
    admin: AdminUser
) {
    const transactions =
        await db.transaction.findMany({
            where: {
                ...(admin.role === "ADMIN"
                    ? {
                          user: {
                              accountManagerId:
                                  admin.id,
                          },
                      }
                    : {}),
            },

            orderBy: {
                transactionDate: "desc",
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
                transactionDate: true,

                user: {
                    select: {
                        id: true,
                        email: true,

                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },

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

    return transactions.map(
        (transaction) => ({
            id: transaction.id,
            reference:
                transaction.reference,
            type: transaction.type,
            status: transaction.status,
            amount:
                transaction.amount.toNumber(),
            title: transaction.title,
            description:
                transaction.description,
            category: transaction.category,
            transactionDate:
                transaction.transactionDate,

            user: {
                id: transaction.user.id,
                email:
                    transaction.user.email,
                firstName:
                    transaction.user.profile
                        ?.firstName ?? "",
                lastName:
                    transaction.user.profile
                        ?.lastName ?? "",
            },

            account: {
                id: transaction.account.id,
                type:
                    transaction.account.type,
                accountNumber:
                    transaction.account
                        .accountNumber,
                currency:
                    transaction.account
                        .currency,
            },
        })
    );
}