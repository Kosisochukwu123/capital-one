
"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-admin";

interface UpdateTransactionBtcValues {
  transactionId: string;
  btcEnabled: boolean;
  btcAmount: string;
  btcProgressPercent: number;
}

type UpdateTransactionBtcResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function updateTransactionBtcAction(
  values: UpdateTransactionBtcValues
): Promise<UpdateTransactionBtcResult> {
  const admin = await requireAdmin();

  if (
    admin.role !== "ADMIN" &&
    admin.role !== "SUPER_ADMIN"
  ) {
    return {
      success: false,
      error: "You do not have permission to update BTC settings.",
    };
  }

  if (
    !values ||
    typeof values.transactionId !== "string" ||
    !values.transactionId.trim() ||
    typeof values.btcEnabled !== "boolean"
  ) {
    return {
      success: false,
      error: "Invalid transaction settings.",
    };
  }

  let amount: Prisma.Decimal | null = null;
  let progress: number | null = null;

  if (values.btcEnabled) {
    if (
      typeof values.btcAmount !== "string" ||
      !/^\d+(\.\d{1,8})?$/.test(values.btcAmount.trim())
    ) {
      return {
        success: false,
        error: "Enter a valid BTC amount with up to 8 decimal places.",
      };
    }

    try {
      amount = new Prisma.Decimal(values.btcAmount.trim());

      if (
        !amount.isFinite() ||
        amount.lte(0) ||
        amount.gte("10000000000")
      ) {
        return {
          success: false,
          error: "Enter a BTC amount greater than zero and within the supported range.",
        };
      }
    } catch {
      return {
        success: false,
        error: "Invalid BTC amount.",
      };
    }

    if (
      !Number.isInteger(values.btcProgressPercent) ||
      values.btcProgressPercent < 0 ||
      values.btcProgressPercent > 100
    ) {
      return {
        success: false,
        error: "BTC progress must be between 0 and 100.",
      };
    }

    progress = values.btcProgressPercent;
  }

  try {
    const result = await db.transaction.updateMany({
      where: {
        id: values.transactionId,

        ...(admin.role === "ADMIN"
          ? {
              user: {
                accountManagerId: admin.id,
              },
            }
          : {}),
      },

      data: {
        btcEnabled: values.btcEnabled,
        btcAmount: values.btcEnabled ? amount : null,
        btcProgressPercent: values.btcEnabled ? progress : null,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Transaction not found or access denied.",
      };
    }

    revalidatePath(`/admin/transactions/${values.transactionId}`);
    revalidatePath("/admin/transactions");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${values.transactionId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update transaction BTC settings error:", error);

    return {
      success: false,
      error: "Unable to save BTC settings. Please try again.",
    };
  }
}
