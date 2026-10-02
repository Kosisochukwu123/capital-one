import {
    AccountStatus,
    TransferPermission,
    UserRole,
} from "@prisma/client";

import { db } from "@/lib/db";

export type AdminAccountStatus =
    | "ACTIVE"
    | "FROZEN";

export type AdminTransferPermission =
    | "ENABLED"
    | "DISABLED"
    | "REVIEW";

interface UpdateAccountInput {
    adminId: string;
    adminRole: UserRole;
    accountId: string;
    status?: AdminAccountStatus;
    transferPermission?: AdminTransferPermission;
    reason?: string;
}

export type UpdateAdminAccountResult = {
    success: true;
    accountId: string;
    status: AccountStatus;
    transferPermission: TransferPermission;
};

export async function updateAdminAccount({
    adminId,
    adminRole,
    accountId,
    status,
    transferPermission,
    reason,
}: UpdateAccountInput): Promise<UpdateAdminAccountResult> {
    if (!status && !transferPermission) {
        throw new Error("NO_CHANGES");
    }

    return db.$transaction(async (tx) => {
        const account =
            await tx.account.findUnique({
                where: {
                    id: accountId,
                },

                select: {
                    id: true,
                    userId: true,
                    status: true,
                    transferPermission: true,
                    type: true,
                    accountNumber: true,

                    user: {
                        select: {
                            role: true,
                            accountManagerId: true,
                        },
                    },
                },
            });

        if (!account) {
            throw new Error(
                "ACCOUNT_NOT_FOUND"
            );
        }

        if (account.user.role !== "USER") {
            throw new Error(
                "ACCOUNT_ACCESS_DENIED"
            );
        }

        if (
            adminRole !== "SUPER_ADMIN" &&
            account.user.accountManagerId !==
                adminId
        ) {
            throw new Error(
                "ACCOUNT_ACCESS_DENIED"
            );
        }

        const statusChanged =
            status !== undefined &&
            status !== account.status;

        const transferPermissionChanged =
            transferPermission !== undefined &&
            transferPermission !==
                account.transferPermission;

        if (
            !statusChanged &&
            !transferPermissionChanged
        ) {
            throw new Error("NO_CHANGES");
        }

        const beforeData = {
            status: account.status,
            transferPermission:
                account.transferPermission,
        };

        const updated =
            await tx.account.update({
                where: {
                    id: account.id,
                },

                data: {
                    ...(statusChanged
                        ? { status }
                        : {}),

                    ...(transferPermissionChanged
                        ? {
                              transferPermission,
                          }
                        : {}),
                },

                select: {
                    id: true,
                    status: true,
                    transferPermission: true,
                },
            });

        const accountName =
            account.type === "CHECKING"
                ? "Checking"
                : "Savings";

        if (statusChanged) {
            if (
                updated.status === "FROZEN"
            ) {
                await tx.notification.create({
                    data: {
                        userId: account.userId,
                        type: "WARNING",
                        title: "Account frozen",
                        message: `Your ${accountName} account has been temporarily frozen.${reason ? ` ${reason}` : ""}`,
                        read: false,
                    },
                });
            }

            if (
                updated.status === "ACTIVE"
            ) {
                await tx.notification.create({
                    data: {
                        userId: account.userId,
                        type: "SUCCESS",
                        title:
                            "Account restored",
                        message: `Your ${accountName} account is active again.`,
                        read: false,
                    },
                });
            }
        }

        if (transferPermissionChanged) {
            if (
                updated.transferPermission ===
                "DISABLED"
            ) {
                await tx.notification.create({
                    data: {
                        userId: account.userId,
                        type: "WARNING",
                        title:
                            "Transfers disabled",
                        message: `Outgoing transfers have been disabled for your ${accountName} account.${reason ? ` ${reason}` : ""}`,
                        read: false,
                    },
                });
            }

            if (
                updated.transferPermission ===
                "REVIEW"
            ) {
                await tx.notification.create({
                    data: {
                        userId: account.userId,
                        type: "INFO",
                        title:
                            "Transfer access under review",
                        message: `Transfer access for your ${accountName} account is currently under review.${reason ? ` ${reason}` : ""}`,
                        read: false,
                    },
                });
            }

            if (
                updated.transferPermission ===
                "ENABLED"
            ) {
                await tx.notification.create({
                    data: {
                        userId: account.userId,
                        type: "SUCCESS",
                        title:
                            "Transfers available",
                        message: `Outgoing transfers are now available for your ${accountName} account.`,
                        read: false,
                    },
                });
            }
        }

        await tx.auditLog.create({
            data: {
                adminId,
                action:
                    "ACCOUNT_CONTROLS_UPDATED",
                targetType: "ACCOUNT",
                targetId: account.id,

                description:
                    reason ||
                    `Controls updated for ${account.type} account.`,

                beforeData,

                afterData: {
                    status:
                        updated.status,

                    transferPermission:
                        updated.transferPermission,

                    reason:
                        reason || null,
                },
            },
        });

        return {
            success: true,
            accountId: updated.id,
            status: updated.status,
            transferPermission:
                updated.transferPermission,
        };
    });
}