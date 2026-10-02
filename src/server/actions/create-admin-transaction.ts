"use server";

import { revalidatePath } from "next/cache";

import {
    adminTransactionSchema,
    type AdminTransactionInput,
} from "@/lib/validations/admin-transaction";

import { requireAdmin } from "@/server/auth/require-admin";

import {
    createAdminTransaction,
    type CreateAdminTransactionResult,
} from "@/server/services/create-admin-transaction";

export async function createAdminTransactionAction(
    values: AdminTransactionInput
): Promise<CreateAdminTransactionResult> {
    const admin = await requireAdmin();

    const parsed =
        adminTransactionSchema.safeParse(
            values
        );

    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]
                    ?.message ??
                "Invalid transaction information.",
        };
    }

    try {
        const result =
            await createAdminTransaction(
                admin.id,
                admin.role,
                parsed.data
            );

        if (result.success) {
            revalidatePath("/");
            revalidatePath(
                "/transactions"
            );
            revalidatePath(
                "/notifications"
            );
            revalidatePath("/admin");
            revalidatePath(
                "/admin/users"
            );
            revalidatePath(
                "/admin/transactions"
            );
            revalidatePath(
                `/admin/users/${parsed.data.userId}`
            );
        }

        return result;
    } catch (error) {
        console.error(
            "Admin transaction creation error:",
            error
        );

        return {
            success: false,
            error:
                "Unable to create transaction.",
        };
    }
}