import {
    Prisma,
    UserRole,
} from "@prisma/client";

import { db } from "@/lib/db";
import { generateTransactionReference } from "@/lib/banking/identifiers";
import {
    adminTransactionSchema,
    type AdminTransactionInput,
} from "@/lib/validations/admin-transaction";

export type CreateAdminTransactionResult =
    | {
          success: true;
          transactionId: string;
          reference: string;
          balance: number;
      }
    | {
          success: false;
          error: string;
      };

function formatCurrency(
    amount: number,
    currency: string
) {
    try {
        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
            }
        ).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

export async function createAdminTransaction(
    adminId: string,
    adminRole: UserRole,
    input: AdminTransactionInput
): Promise<CreateAdminTransactionResult> {
    const parsed =
        adminTransactionSchema.safeParse(
            input
        );

    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]
                    ?.message ??
                "Invalid transaction information.",
        };
    }

    const data = parsed.data;

    const account =
        await db.account.findUnique({
            where: {
                id: data.accountId,
            },

            select: {
                id: true,
                userId: true,
                type: true,
                balance: true,
                currency: true,
                status: true,

                user: {
                    select: {
                        role: true,
                        accountManagerId:
                            true,
                    },
                },
            },
        });

    if (!account) {
        return {
            success: false,
            error:
                "Account could not be found.",
        };
    }

    if (
        account.userId !== data.userId
    ) {
        return {
            success: false,
            error:
                "The selected account does not belong to this customer.",
        };
    }

    if (account.user.role !== "USER") {
        return {
            success: false,
            error:
                "This account cannot be modified from customer transaction controls.",
        };
    }

    if (
        adminRole !== "SUPER_ADMIN" &&
        account.user.accountManagerId !==
            adminId
    ) {
        return {
            success: false,
            error:
                "You do not have permission to manage this customer's account.",
        };
    }

    if (account.status !== "ACTIVE") {
        return {
            success: false,
            error:
                "Transactions cannot be added to this account.",
        };
    }

    const amount = new Prisma.Decimal(
        data.amount
    );

    if (
        data.type === "DEBIT" &&
        account.balance.lessThan(amount)
    ) {
        return {
            success: false,
            error:
                "The account does not have enough balance for this debit.",
        };
    }

    let reference =
        generateTransactionReference();

    while (
        await db.transaction.findUnique({
            where: {
                reference,
            },

            select: {
                id: true,
            },
        })
    ) {
        reference =
            generateTransactionReference();
    }

    const transactionDate = new Date(
        data.transactionDate
    );

    if (
        Number.isNaN(
            transactionDate.getTime()
        )
    ) {
        return {
            success: false,
            error:
                "Invalid transaction date.",
        };
    }

    const result =
        await db.$transaction(
            async (tx) => {
                const transaction =
                    await tx.transaction.create({
                        data: {
                            userId:
                                account.userId,

                            accountId:
                                account.id,

                            reference,
                            type: data.type,
                            status:
                                "COMPLETED",

                            amount,

                            title:
                                data.title,

                            description:
                                data.description ||
                                null,

                            memo:
                                data.memo ||
                                null,

                            adminNote:
                                data.adminNote ||
                                null,

                            transactionDate,

                            completedAt:
                                new Date(),
                        },
                    });

                const updatedAccount =
                    await tx.account.update({
                        where: {
                            id: account.id,
                        },

                        data: {
                            balance:
                                data.type ===
                                "CREDIT"
                                    ? {
                                          increment:
                                              amount,
                                      }
                                    : {
                                          decrement:
                                              amount,
                                      },
                        },

                        select: {
                            balance: true,
                        },
                    });

                const formattedAmount =
                    formatCurrency(
                        Number(
                            data.amount
                        ),
                        account.currency
                    );

                const accountName =
                    account.type ===
                    "CHECKING"
                        ? "Checking"
                        : "Savings";

                await tx.notification.create({
                    data: {
                        userId:
                            account.userId,

                        type:
                            data.type ===
                            "CREDIT"
                                ? "SUCCESS"
                                : "INFO",

                        title:
                            data.type ===
                            "CREDIT"
                                ? "Account credited"
                                : "Account debited",

                        message:
                            data.type ===
                            "CREDIT"
                                ? `Your ${accountName} account has been credited with ${formattedAmount}.`
                                : `${formattedAmount} has been debited from your ${accountName} account.`,

                        read: false,
                    },
                });

                await tx.auditLog.create({
                    data: {
                        adminId,

                        action:
                            "ADMIN_TRANSACTION_CREATED",

                        targetType:
                            "TRANSACTION",

                        targetId:
                            transaction.id,

                        description:
                            `${data.type} transaction ${reference} created by administrator.`,

                        afterData: {
                            transactionId:
                                transaction.id,

                            reference,

                            userId:
                                account.userId,

                            accountId:
                                account.id,

                            type:
                                data.type,

                            amount:
                                data.amount,

                            status:
                                "COMPLETED",

                            adminNote:
                                data.adminNote ||
                                null,
                        },
                    },
                });

                return {
                    transactionId:
                        transaction.id,

                    reference:
                        transaction.reference,

                    balance:
                        updatedAccount.balance.toNumber(),
                };
            }
        );

    return {
        success: true,
        ...result,
    };
}