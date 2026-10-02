import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";

export async function getAccountManagerDetails(
    managerId: string
) {
    await requireSuperAdmin();

    const manager = await db.user.findFirst({
        where: {
            id: managerId,
            role: "ADMIN",
        },

        select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,

            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                },
            },

            managedCustomers: {
                orderBy: {
                    createdAt: "desc",
                },

                select: {
                    id: true,
                    email: true,
                    customerId: true,
                    status: true,
                    createdAt: true,

                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },

                    accounts: {
                        where: {
                            status: {
                                not: "CLOSED",
                            },
                        },

                        select: {
                            id: true,
                            type: true,
                            accountNumber: true,
                            status: true,
                        },
                    },
                },
            },
        },
    });

    if (!manager) {
        notFound();
    }

    const otherManagers = await db.user.findMany({
        where: {
            role: "ADMIN",
            status: "ACTIVE",
            id: {
                not: manager.id,
            },
        },

        orderBy: {
            createdAt: "desc",
        },

        select: {
            id: true,
            email: true,

            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    return {
        manager,
        otherManagers,
    };
}