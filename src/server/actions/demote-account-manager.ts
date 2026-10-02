"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";

export async function demoteAccountManager(
    managerId: string,
    confirmation: string
) {
    const superAdmin =
        await requireSuperAdmin();

    if (!managerId) {
        return {
            success: false,
            error: "Account manager is required.",
        };
    }

    if (confirmation !== "DEMOTE") {
        return {
            success: false,
            error: "Type DEMOTE to confirm.",
        };
    }

    try {
        const manager =
            await db.user.findUnique({
                where: {
                    id: managerId,
                },

                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    accountManagerId: true,

                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },

                    _count: {
                        select: {
                            managedCustomers: true,
                        },
                    },
                },
            });

        if (!manager) {
            return {
                success: false,
                error: "Account manager not found.",
            };
        }

        if (manager.id === superAdmin.id) {
            return {
                success: false,
                error: "You cannot demote your own super administrator account.",
            };
        }

        if (manager.role !== "ADMIN") {
            return {
                success: false,
                error: "This user is not an account manager.",
            };
        }

        if (
            manager._count.managedCustomers > 0
        ) {
            return {
                success: false,
                error:
                    manager._count
                        .managedCustomers === 1
                        ? "This account manager still has 1 assigned customer. Reassign or unassign the customer before demoting the manager."
                        : `This account manager still has ${manager._count.managedCustomers} assigned customers. Reassign or unassign them before demoting the manager.`,
            };
        }

        const managerName =
            manager.profile
                ? `${manager.profile.firstName} ${manager.profile.lastName}`.trim()
                : manager.email;

        await db.$transaction(
            async (tx) => {
                await tx.user.update({
                    where: {
                        id: manager.id,
                    },

                    data: {
                        role: "USER",
                        accountManagerId: null,
                    },
                });

                await tx.auditLog.create({
                    data: {
                        adminId:
                            superAdmin.id,

                        action:
                            "ACCOUNT_MANAGER_DEMOTED",

                        targetType:
                            "USER",

                        targetId:
                            manager.id,

                        description:
                            `Super administrator demoted account manager ${managerName} to a customer.`,

                        beforeData: {
                            role:
                                manager.role,
                            status:
                                manager.status,
                            accountManagerId:
                                manager.accountManagerId,
                            managedCustomers:
                                manager._count
                                    .managedCustomers,
                        },

                        afterData: {
                            role: "USER",
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
            `/admin/users/${manager.id}`
        );
        revalidatePath(
            "/admin/account-managers"
        );
        revalidatePath(
            `/admin/account-managers/${manager.id}`
        );

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "Demote account manager error:",
            error
        );

        return {
            success: false,
            error:
                "Unable to demote this account manager.",
        };
    }
}