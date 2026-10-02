"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";

export async function deleteCustomer(
    customerId: string,
    confirmation: string
) {
    const superAdmin =
        await requireSuperAdmin();

    if (!customerId) {
        return {
            success: false,
            error: "Customer is required.",
        };
    }

    if (confirmation !== "DELETE") {
        return {
            success: false,
            error: "Type DELETE to confirm.",
        };
    }

    try {
        const customer =
            await db.user.findUnique({
                where: {
                    id: customerId,
                },

                select: {
                    id: true,
                    email: true,
                    role: true,

                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },

                    accounts: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

        if (!customer) {
            return {
                success: false,
                error: "Customer not found.",
            };
        }

        if (customer.role !== "USER") {
            return {
                success: false,
                error: "Only customer accounts can be deleted from this page.",
            };
        }

        if (customer.id === superAdmin.id) {
            return {
                success: false,
                error: "You cannot delete your own administrator account.",
            };
        }

        const customerName =
            customer.profile
                ? `${customer.profile.firstName} ${customer.profile.lastName}`.trim()
                : customer.email;

        const accountIds =
            customer.accounts.map(
                (account) => account.id
            );

        await db.$transaction(
            async (tx) => {
                /*
                 * Transfers can reference accounts belonging
                 * to this customer from either side.
                 *
                 * Delete them explicitly before deleting
                 * the accounts/user.
                 */
                if (accountIds.length > 0) {
                    await tx.transfer.deleteMany({
                        where: {
                            OR: [
                                {
                                    fromAccountId: {
                                        in: accountIds,
                                    },
                                },
                                {
                                    toAccountId: {
                                        in: accountIds,
                                    },
                                },
                            ],
                        },
                    });
                }

                /*
                 * Create the audit record before deleting
                 * the customer.
                 *
                 * The audit log belongs to the SUPER_ADMIN,
                 * not the deleted customer, so it remains.
                 */
                await tx.auditLog.create({
                    data: {
                        adminId:
                            superAdmin.id,

                        action:
                            "CUSTOMER_DELETED",

                        targetType:
                            "USER",

                        targetId:
                            customer.id,

                        description:
                            `Super administrator permanently deleted customer ${customerName}.`,

                        beforeData: {
                            email:
                                customer.email,
                            role:
                                customer.role,
                            name:
                                customerName,
                            accountCount:
                                customer.accounts
                                    .length,
                        },

                        afterData: {
                            deleted: true,
                        },
                    },
                });

                /*
                 * Profile, security settings, accounts,
                 * transactions, notifications, activity
                 * logs, support data, etc. are removed by
                 * the cascade rules in the Prisma schema.
                 */
                await tx.user.delete({
                    where: {
                        id: customer.id,
                    },
                });
            }
        );

        revalidatePath("/admin");
        revalidatePath("/admin/users");
        revalidatePath(
            "/admin/account-managers"
        );
        revalidatePath(
            "/admin/transactions"
        );
        revalidatePath(
            "/admin/messages"
        );

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "Delete customer error:",
            error
        );

        return {
            success: false,
            error: "Unable to delete this customer.",
        };
    }
}