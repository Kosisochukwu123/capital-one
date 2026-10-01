"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/server/auth/require-admin";
import {
  updateTransactionStatus,
  type TransactionDecision,
  type UpdateTransactionStatusResult,
} from "@/server/services/update-transaction-status";

interface UpdateTransactionStatusValues {
  transactionId: string;
  decision: TransactionDecision;
  statusReason?: string;
  adminNote?: string;
}

type UpdateTransactionStatusActionResult =
  | UpdateTransactionStatusResult
  | {
      success: false;
      error: string;
    };

export async function updateTransactionStatusAction(
  values: UpdateTransactionStatusValues,
): Promise<UpdateTransactionStatusActionResult> {
  const admin = await requireAdmin();

  try {
    const result = await updateTransactionStatus({
      adminId: admin.id,
      transactionId: values.transactionId,
      decision: values.decision,
      statusReason: values.statusReason?.trim(),
      adminNote: values.adminNote?.trim(),
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/notifications");
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/transactions/${values.transactionId}`);

    return result;
  } catch (error) {
    console.error("Admin transaction update error:", error);

    if (
      error instanceof Error &&
      error.message === "TRANSACTION_ALREADY_PROCESSED"
    ) {
      return {
        success: false,
        error: "This transaction has already been processed.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "TRANSFER_ALREADY_PROCESSED"
    ) {
      return {
        success: false,
        error: "This transfer has already been processed.",
      };
    }

    return {
      success: false,
      error: "Unable to update this transaction.",
    };
  }
}
