import { db } from "@/lib/db";

interface ResetUserPinInput {
  adminId: string;
  userId: string;
}

export type ResetUserPinResult = {
  success: true;
  userId: string;
};

export async function resetUserPin({
  adminId,
  userId,
}: ResetUserPinInput): Promise<ResetUserPinResult> {
  if (adminId === userId) {
    throw new Error("CANNOT_RESET_SELF");
  }

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        requiresPinSetup: true,
        securitySettings: {
          select: {
            id: true,
            transactionPinHash: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (user.role === "ADMIN") {
      throw new Error("CANNOT_RESET_ADMIN");
    }

    if (!user.securitySettings) {
      throw new Error(
        "SECURITY_SETTINGS_NOT_FOUND"
      );
    }

    await tx.securitySettings.update({
      where: {
        id: user.securitySettings.id,
      },
      data: {
        transactionPinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
      },
    });

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        requiresPinSetup: true,
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        type: "SECURITY",
        title: "Transaction PIN reset",
        message:
          "Your transaction PIN has been reset. Create a new transaction PIN before making another transfer.",
        read: false,
      },
    });

    await tx.auditLog.create({
      data: {
        adminId,
        action:
          "TRANSACTION_PIN_RESET_REQUIRED",
        targetType: "USER",
        targetId: user.id,
        description:
          "Administrator required the customer to create a new transaction PIN.",
        beforeData: {
          requiresPinSetup:
            user.requiresPinSetup,
          pinConfigured: Boolean(
            user.securitySettings
              .transactionPinHash
          ),
        },
        afterData: {
          requiresPinSetup: true,
          pinConfigured: false,
        },
      },
    });

    return {
      success: true,
      userId: user.id,
    };
  });
}