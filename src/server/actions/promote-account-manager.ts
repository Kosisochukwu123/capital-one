"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";

export async function promoteAccountManager(
    userId: string
) {
    const superAdmin =
        await requireSuperAdmin();

    if (!userId) {
        return {
            success: false,
            error: "Select a user to promote.",
        };
    }

    try {
        const user =
            await db.user.findUnique({
                where: {
                    id: userId,
                },

                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    accountManagerId: true,
                },
            });

        if (!user) {
            return {
                success: false,
                error: "User not found.",
            };
        }

        if (user.id === superAdmin.id) {
            return {
                success: false,
                error: "You cannot change your own administrator role here.",
            };
        }

        if (user.role !== "USER") {
            return {
                success: false,
                error: "Only normal users can be promoted to account manager.",
            };
        }

        if (user.status !== "ACTIVE") {
            return {
                success: false,
                error: "Only active users can be promoted.",
            };
        }

        if (user.accountManagerId) {
            return {
                success: false,
                error: "Unassign this customer from their current account manager before promoting them.",
            };
        }

        await db.$transaction(
            async (tx) => {
                await tx.user.update({
                    where: {
                        id: user.id,
                    },

                    data: {
                        role: "ADMIN",
                        accountManagerId: null,
                    },
                });

                await tx.auditLog.create({
                    data: {
                        adminId:
                            superAdmin.id,

                        action:
                            "ACCOUNT_MANAGER_PROMOTED",

                        targetType: "USER",

                        targetId: user.id,

                        description:
                            "Super administrator promoted a user to account manager.",

                        beforeData: {
                            role: user.role,
                            accountManagerId:
                                user.accountManagerId,
                        },

                        afterData: {
                            role: "ADMIN",
                            accountManagerId:
                                null,
                        },
                    },
                });
            }
        );

        revalidatePath("/admin");
        revalidatePath("/admin/users");
        revalidatePath(
            `/admin/users/${user.id}`
        );
        revalidatePath(
            "/admin/account-managers"
        );

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "Promote account manager error:",
            error
        );

        return {
            success: false,
            error: "Unable to promote this user.",
        };
    }
}