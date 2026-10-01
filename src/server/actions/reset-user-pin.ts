"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/server/auth/require-admin";
import {
  resetUserPin,
  type ResetUserPinResult,
} from "@/server/services/reset-user-pin";

type ResetUserPinActionResult =
  | ResetUserPinResult
  | {
      success: false;
      error: string;
    };

export async function resetUserPinAction(
  userId: string,
): Promise<ResetUserPinActionResult> {
  const admin = await requireAdmin();

  try {
    const result = await resetUserPin({
      adminId: admin.id,
      userId,
    });

    revalidatePath("/admin/users");

    revalidatePath(`/admin/users/${userId}`);

    revalidatePath("/notifications");

    revalidatePath("/");

    revalidatePath("/payments");

    return result;
  } catch (error) {
    console.error("Reset transaction PIN error:", error);

    return {
      success: false,
      error: "Unable to require a new transaction PIN.",
    };
  }
}
