"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/server/auth/require-admin";
import {
  updateAdminAccount,
  type AdminAccountStatus,
  type AdminTransferPermission,
  type UpdateAdminAccountResult,
} from "@/server/services/update-admin-account";

interface UpdateAdminAccountValues {
  accountId: string;
  userId: string;
  status?: AdminAccountStatus;
  transferPermission?: AdminTransferPermission;
  reason?: string;
}

type UpdateAdminAccountActionResult =
  | UpdateAdminAccountResult
  | {
      success: false;
      error: string;
    };

export async function updateAdminAccountAction(
  values: UpdateAdminAccountValues,
): Promise<UpdateAdminAccountActionResult> {
  const admin = await requireAdmin();

  try {
    const result = await updateAdminAccount({
      adminId: admin.id,
      accountId: values.accountId,
      status: values.status,
      transferPermission: values.transferPermission,
      reason: values.reason?.trim(),
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/notifications");
    revalidatePath("/payments");
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${values.userId}`);

    return result;
  } catch (error) {
    console.error("Admin account update error:", error);

    return {
      success: false,
      error: "Unable to update this account.",
    };
  }
}
