"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/server/auth/require-admin";
import {
  updateAdminUserStatus,
  type AdminUserStatus,
  type UpdateAdminUserStatusResult,
} from "@/server/services/update-admin-user";

interface UpdateAdminUserStatusValues {
  userId: string;
  status: AdminUserStatus;
  reason?: string;
}

type UpdateAdminUserStatusActionResult =
  | UpdateAdminUserStatusResult
  | {
      success: false;
      error: string;
    };

export async function updateAdminUserStatusAction(
  values: UpdateAdminUserStatusValues
): Promise<UpdateAdminUserStatusActionResult> {
  const admin = await requireAdmin();

  try {
    const result =
      await updateAdminUserStatus({
        adminId: admin.id,
        userId: values.userId,
        status: values.status,
        reason: values.reason?.trim(),
      });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(
      `/admin/users/${values.userId}`
    );

    return result;
  } catch (error) {
    console.error(
      "Admin user update error:",
      error
    );

    return {
      success: false,
      error: "Unable to update this user.",
    };
  }
}