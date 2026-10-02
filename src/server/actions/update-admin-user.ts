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
                adminRole: admin.role,
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

        if (error instanceof Error) {
            if (
                error.message ===
                "USER_ACCESS_DENIED"
            ) {
                return {
                    success: false,
                    error:
                        "You do not have permission to manage this customer.",
                };
            }

            if (
                error.message ===
                "USER_NOT_FOUND"
            ) {
                return {
                    success: false,
                    error:
                        "Customer could not be found.",
                };
            }

            if (
                error.message ===
                "CANNOT_MODIFY_SELF"
            ) {
                return {
                    success: false,
                    error:
                        "You cannot modify your own account here.",
                };
            }

            if (
                error.message ===
                "CANNOT_MODIFY_ADMIN"
            ) {
                return {
                    success: false,
                    error:
                        "Administrator accounts cannot be modified from customer controls.",
                };
            }
        }

        return {
            success: false,
            error:
                "Unable to update this user.",
        };
    }
}