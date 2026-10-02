import {
    Prisma,
    UserRole,
} from "@prisma/client";

import { db } from "@/lib/db";

export type TransactionDecision =
    | "COMPLETED"
    | "FAILED";

interface UpdateTransactionStatusInput {
    adminId: string;
    adminRole: UserRole;
    transactionId: string;
    decision: TransactionDecision;
    statusReason?: string;
    adminNote?: string;
}

export type UpdateTransactionStatusResult = {
    success: true;
    transactionId: string;
    reference: string;
    status: TransactionDecision;
};

function formatAmount(
    amount: Prisma.Decimal,
    currency: string
) {
    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency,
        }
    ).format(amount.toNumber());
}

export async function updateTransactionStatus({
    adminId,
    adminRole,
    transactionId,
    decision,
    statusReason,
    adminNote,
}: UpdateTransactionStatusInput): Promise<UpdateTransactionStatusResult> {
    return db.$transaction(async (tx) => {
        const transaction =
            await tx.transaction.findUnique({
                where: {
                    id: transactionId,
                },

                select: {
                    id: true,
                    userId: true,
                    accountId: true,
                    reference: true,
                    type: true,
                    status: true,
                    amount: true,
                    statusReason: true,
                    adminNote: true,

                    user: {
                        select: {
                            accountManagerId:
                                true,
                        },
                    },

                    account: {
                        select: {
                            currency: true,
                        },
                    },
                },
            });

        if (!transaction) {
            throw new Error(
                "TRANSACTION_NOT_FOUND"
            );
        }

        /*
         * SUPER_ADMIN can manage every
         * customer's transaction.
         *
         * ADMIN can manage only customers
         * assigned to them.
         */
        if (
            adminRole !== "SUPER_ADMIN" &&
            transaction.user
                .accountManagerId !==
                adminId
        ) {
            throw new Error(
                "TRANSACTION_ACCESS_DENIED"
            );
        }

        if (
            transaction.status !== "PENDING"
        ) {
            throw new Error(
                "TRANSACTION_ALREADY_PROCESSED"
            );
        }

        if (
            transaction.type !== "DEBIT"
        ) {
            throw new Error(
                "INVALID_TRANSACTION_TYPE"
            );
        }

        const transfer =
            await tx.transfer.findUnique({
                where: {
                    reference:
                        transaction.reference,
                },

                select: {
                    id: true,
                    status: true,
                    recipientName: true,
                },
            });

        if (!transfer) {
            throw new Error(
                "TRANSFER_NOT_FOUND"
            );
        }

        if (
            transfer.status !== "PENDING"
        ) {
            throw new Error(
                "TRANSFER_ALREADY_PROCESSED"
            );
        }

        const formattedAmount =
            formatAmount(
                transaction.amount,
                transaction.account.currency
            );

        const recipientName =
            transfer.recipientName ||
            "recipient";

        const beforeData = {
            transactionStatus:
                transaction.status,
            transferStatus:
                transfer.status,
            statusReason:
                transaction.statusReason,
            adminNote:
                transaction.adminNote,
        };

        if (
            decision === "COMPLETED"
        ) {
            await tx.transaction.update({
                where: {
                    id: transaction.id,
                },

                data: {
                    status: "COMPLETED",

                    statusReason:
                        statusReason ||
                        "Your transfer has been completed.",

                    adminNote:
                        adminNote || null,

                    completedAt:
                        new Date(),

                    failedAt: null,
                },
            });

            await tx.transfer.update({
                where: {
                    id: transfer.id,
                },

                data: {
                    status: "COMPLETED",
                    completedAt:
                        new Date(),
                    failureReason: null,
                },
            });

            await tx.notification.create({
                data: {
                    userId:
                        transaction.userId,

                    type: "SUCCESS",

                    title:
                        "Transfer completed",

                    message: `${formattedAmount} transfer to ${recipientName} has been completed successfully.`,

                    read: false,
                },
            });
        }

        if (decision === "FAILED") {
            await tx.account.update({
                where: {
                    id:
                        transaction.accountId,
                },

                data: {
                    balance: {
                        increment:
                            transaction.amount,
                    },
                },
            });

            let refundReference =
                `${transaction.reference}-REFUND`;

            let refundSuffix = 1;

            while (
                await tx.transaction.findUnique(
                    {
                        where: {
                            reference:
                                refundReference,
                        },

                        select: {
                            id: true,
                        },
                    }
                )
            ) {
                refundReference =
                    `${transaction.reference}-REFUND-${refundSuffix}`;

                refundSuffix++;
            }

            await tx.transaction.create({
                data: {
                    userId:
                        transaction.userId,

                    accountId:
                        transaction.accountId,

                    reference:
                        refundReference,

                    type: "CREDIT",

                    status: "COMPLETED",

                    amount:
                        transaction.amount,

                    title:
                        "Transfer refund",

                    description:
                        `Refund for failed transfer ${transaction.reference}`,

                    category: "Refund",

                    memo: null,

                    statusReason:
                        "The amount from your failed transfer has been returned to your account.",

                    transactionDate:
                        new Date(),

                    completedAt:
                        new Date(),
                },
            });

            await tx.transaction.update({
                where: {
                    id: transaction.id,
                },

                data: {
                    status: "FAILED",

                    statusReason:
                        statusReason ||
                        "Your transfer could not be completed.",

                    adminNote:
                        adminNote || null,

                    failedAt:
                        new Date(),

                    completedAt: null,
                },
            });

            await tx.transfer.update({
                where: {
                    id: transfer.id,
                },

                data: {
                    status: "FAILED",

                    failureReason:
                        statusReason ||
                        "Transfer failed.",
                },
            });

            await tx.notification.create({
                data: {
                    userId:
                        transaction.userId,

                    type: "WARNING",

                    title:
                        "Transfer failed",

                    message: `${formattedAmount} transfer to ${recipientName} could not be completed. The funds have been returned to your account.`,

                    read: false,
                },
            });
        }

        const afterData = {
            transactionStatus: decision,
            transferStatus: decision,

            statusReason:
                statusReason ||
                (decision ===
                "COMPLETED"
                    ? "Your transfer has been completed."
                    : "Your transfer could not be completed."),

            adminNote:
                adminNote || null,
        };

        await tx.auditLog.create({
            data: {
                adminId,

                action:
                    decision ===
                    "COMPLETED"
                        ? "TRANSFER_COMPLETED"
                        : "TRANSFER_FAILED",

                targetType:
                    "TRANSACTION",

                targetId:
                    transaction.id,

                description:
                    `${transaction.reference} changed from PENDING to ${decision}.`,

                beforeData,
                afterData,
            },
        });

        return {
            success: true,
            transactionId:
                transaction.id,
            reference:
                transaction.reference,
            status: decision,
        };
    });
}