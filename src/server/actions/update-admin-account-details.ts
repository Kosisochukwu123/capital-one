"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-admin";

interface UpdateAdminAccountDetailsInput {
  userId: string;
  accountId: string;
  openedAt: string;
}

export async function updateAdminAccountDetailsAction(
  values: UpdateAdminAccountDetailsInput
) {
  const admin = await requireAdmin();

  try {
    const openedAt = new Date(
      `${values.openedAt}T12:00:00`
    );

    if (Number.isNaN(openedAt.getTime())) {
      return {
        success: false,
        error: "Enter a valid opening date.",
      };
    }

    const account =
      await db.account.findFirst({
        where: {
          id: values.accountId,
          userId: values.userId,
        },

        select: {
          id: true,
          userId: true,
          type: true,
          accountNumber: true,
          openedAt: true,
        },
      });

    if (!account) {
      return {
        success: false,
        error: "Account not found.",
      };
    }

    const updatedAccount =
      await db.$transaction(
        async (tx) => {
          const updated =
            await tx.account.update({
              where: {
                id: account.id,
              },

              data: {
                openedAt,
              },

              select: {
                id: true,
                openedAt: true,
              },
            });

          await tx.auditLog.create({
            data: {
              adminId: admin.id,
              action:
                "ACCOUNT_DETAILS_UPDATED",
              targetType: "ACCOUNT",
              targetId: account.id,
              description: `Opening date updated for ${account.type} account.`,
              beforeData: {
                openedAt:
                  account.openedAt.toISOString(),
              },
              afterData: {
                openedAt:
                  updated.openedAt.toISOString(),
              },
            },
          });

          return updated;
        }
      );

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(
      `/admin/users/${values.userId}`
    );

    return {
      success: true,
      openedAt:
        updatedAccount.openedAt,
    };
  } catch (error) {
    console.error(
      "Account details update error:",
      error
    );

    return {
      success: false,
      error:
        "Unable to update account information.",
    };
  }
}