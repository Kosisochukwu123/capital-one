"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  adminTransactionSchema,
  type AdminTransactionInput,
} from "@/lib/validations/admin-transaction";
import {
  createAdminTransaction,
  type CreateAdminTransactionResult,
} from "@/server/services/create-admin-transaction";

export async function createAdminTransactionAction(
  values: AdminTransactionInput,
): Promise<CreateAdminTransactionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const admin = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
      status: true,
    },
  });

  if (!admin || admin.role !== "ADMIN" || admin.status !== "ACTIVE") {
    return {
      success: false,
      error: "Administrator access is required.",
    };
  }

  const parsed = adminTransactionSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ?? "Invalid transaction information.",
    };
  }

  try {
    const result = await createAdminTransaction(session.user.id, parsed.data);

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/transactions");
      revalidatePath("/help");
      revalidatePath("/admin");
      revalidatePath("/admin/users");
      revalidatePath(`/admin/users/${parsed.data.userId}`);
    }

    return result;
  } catch (error) {
    console.error("Admin transaction creation error:", error);

    return {
      success: false,
      error: "Unable to create transaction.",
    };
  }
}
