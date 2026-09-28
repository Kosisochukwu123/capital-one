import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import {
  transactionPinSchema,
  type TransactionPinInput,
} from "@/lib/validations/security";

export async function setTransactionPin(
  userId: string,
  input: TransactionPinInput
) {
  const parsed =
    transactionPinSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid PIN.",
    };
  }

  const pinHash = await bcrypt.hash(
    parsed.data.pin,
    12
  );

  await db.$transaction([
    db.securitySettings.update({
      where: {
        userId,
      },

      data: {
        transactionPinHash: pinHash,
        pinCreatedAt: new Date(),
        pinUpdatedAt: new Date(),
        pinFailedAttempts: 0,
        pinLockedUntil: null,
      },
    }),

    db.user.update({
      where: {
        id: userId,
      },

      data: {
        requiresPinSetup: false,
        onboardingComplete: true,
      },
    }),

    db.activityLog.create({
      data: {
        userId,
        action: "TRANSACTION_PIN_CREATED",
        description:
          "Transaction PIN configured.",
      },
    }),
  ]);

  return {
    success: true,
  };
}