import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";

type AdminUser = {
    id: string;
    role: UserRole;
};

export async function getAdminTransactionDetails(
    transactionId: string,
    admin: AdminUser
) {
    const transaction =
        await db.transaction.findFirst({
            where: {
                id: transactionId,

                ...(admin.role === "ADMIN"
                    ? {
                          user: {
                              accountManagerId:
                                  admin.id,
                          },
                      }
                    : {}),
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
                adminNote: true,
                transactionDate: true,
                createdAt: true,
                updatedAt: true,
                completedAt: true,
                failedAt: true,

                user: {
                    select: {
                        id: true,
                        email: true,
                        customerId: true,

                        profile: {
                            select: {
                                firstName: true,
                                middleName: true,
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
                        balance: true,
                        status: true,
                        openedAt: true,
                    },
                },
            },
        });

    if (!transaction) {
        return null;
    }

    const transfer =
        await db.transfer.findUnique({
            where: {
                reference:
                    transaction.reference,
            },

            select: {
                id: true,
                recipientName: true,
                recipientAccountNumber: true,
                recipientBankName: true,
                amount: true,
                currency: true,
                status: true,
                failureReason: true,
                requiresVerification: true,
                createdAt: true,
                updatedAt: true,
                completedAt: true,
            },
        });

    return {
        id: transaction.id,
        reference: transaction.reference,
        type: transaction.type,
        status: transaction.status,
        amount:
            transaction.amount.toNumber(),
        title: transaction.title,
        description:
            transaction.description,
        category: transaction.category,
        memo: transaction.memo,
        statusReason:
            transaction.statusReason,
        adminNote: transaction.adminNote,
        transactionDate:
            transaction.transactionDate,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        completedAt:
            transaction.completedAt,
        failedAt: transaction.failedAt,

        user: {
            id: transaction.user.id,
            email: transaction.user.email,
            customerId:
                transaction.user.customerId,

            fullName:
                transaction.user.profile
                    ? [
                          transaction.user
                              .profile
                              .firstName,
                          transaction.user
                              .profile
                              .middleName,
                          transaction.user
                              .profile
                              .lastName,
                      ]
                          .filter(Boolean)
                          .join(" ")
                    : transaction.user
                          .email,
        },

        account: {
            id: transaction.account.id,
            type: transaction.account.type,
            accountNumber:
                transaction.account
                    .accountNumber,
            currency:
                transaction.account.currency,
            balance:
                transaction.account.balance.toNumber(),
            status:
                transaction.account.status,
            openedAt:
                transaction.account.openedAt,
        },

        transfer: transfer
            ? {
                  id: transfer.id,
                  recipientName:
                      transfer.recipientName,
                  recipientAccountNumber:
                      transfer.recipientAccountNumber,
                  recipientBankName:
                      transfer.recipientBankName,
                  amount:
                      transfer.amount.toNumber(),
                  currency:
                      transfer.currency,
                  status: transfer.status,
                  failureReason:
                      transfer.failureReason,
                  requiresVerification:
                      transfer.requiresVerification,
                  createdAt:
                      transfer.createdAt,
                  updatedAt:
                      transfer.updatedAt,
                  completedAt:
                      transfer.completedAt,
              }
            : null,
    };
}