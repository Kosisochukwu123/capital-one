import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";

export async function getAccountManagerDashboard() {
    await requireSuperAdmin();

    const [managers, unassignedCustomers, totalCustomers] =
        await Promise.all([
            db.user.findMany({
                where: {
                    role: "ADMIN",
                },

                orderBy: [
                    {
                        status: "asc",
                    },
                    {
                        createdAt: "desc",
                    },
                ],

                select: {
                    id: true,
                    email: true,
                    status: true,
                    createdAt: true,

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
            }),

            db.user.findMany({
                where: {
                    role: "USER",
                    accountManagerId: null,
                },

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
                        },
                    },
                },
            }),

            db.user.count({
                where: {
                    role: "USER",
                },
            }),
        ]);

    const assignedCustomers =
        totalCustomers -
        unassignedCustomers.length;

    return {
        managers,
        unassignedCustomers,

        stats: {
            managers: managers.length,
            assignedCustomers,
            unassignedCustomers:
                unassignedCustomers.length,
            totalCustomers,
        },
    };
}