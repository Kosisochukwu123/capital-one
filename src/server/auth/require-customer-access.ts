import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-admin";

export async function requireCustomerAccess(
  customerId: string
) {
  const admin = await requireAdmin();

  const customer = await db.user.findUnique({
    where: {
      id: customerId,
    },
    select: {
      id: true,
      role: true,
      accountManagerId: true,
    },
  });

  if (!customer) {
    notFound();
  }

  if (customer.role !== "USER") {
    notFound();
  }

  if (admin.role === "SUPER_ADMIN") {
    return {
      admin,
      customer,
    };
  }

  if (
    customer.accountManagerId !== admin.id
  ) {
    redirect("/admin/users");
  }

  return {
    admin,
    customer,
  };
}