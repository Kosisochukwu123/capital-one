import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";

export async function getAccountManagers() {
  await requireSuperAdmin();

  const managers = await db.user.findMany({
    where: {
      role: "ADMIN",
    },
    orderBy: {
      createdAt: "desc",
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
        },
      },
      _count: {
        select: {
          managedCustomers: true,
        },
      },
    },
  });

  return managers;
}