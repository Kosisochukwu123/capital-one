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
    userId: string
): Promise<ResetUserPinActionResult> {
    const admin = await requireAdmin();

    try {
        const result =
            await resetUserPin({
                adminId: admin.id,
                adminRole: admin.role,
                userId,
            });

        revalidatePath("/admin/users");
        revalidatePath(
            `/admin/users/${userId}`
        );
        revalidatePath("/notifications");
        revalidatePath("/");
        revalidatePath("/payments");

        return result;
    } catch (error) {
        console.error(
            "Reset transaction PIN error:",
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
                        "You do not have permission to manage this customer's transaction PIN.",
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
                "CANNOT_RESET_SELF"
            ) {
                return {
                    success: false,
                    error:
                        "You cannot reset your own transaction PIN from customer controls.",
                };
            }

            if (
                error.message ===
                "CANNOT_RESET_ADMIN"
            ) {
                return {
                    success: false,
                    error:
                        "Administrator transaction PINs cannot be reset from customer controls.",
                };
            }

            if (
                error.message ===
                "SECURITY_SETTINGS_NOT_FOUND"
            ) {
                return {
                    success: false,
                    error:
                        "Security settings could not be found for this customer.",
                };
            }
        }

        return {
            success: false,
            error:
                "Unable to require a new transaction PIN.",
        };
    }
}