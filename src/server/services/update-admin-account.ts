import {
  AccountStatus,
  TransferPermission,
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
        },
      });

    if (!account) {
      throw new Error(
        "ACCOUNT_NOT_FOUND"
      );
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
          ...(status
            ? { status }
            : {}),
          ...(transferPermission
            ? { transferPermission }
            : {}),
        },
        select: {
          id: true,
          status: true,
          transferPermission: true,
        },
      });

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
          status: updated.status,
          transferPermission:
            updated.transferPermission,
          reason: reason || null,
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