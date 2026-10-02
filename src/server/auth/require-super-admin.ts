import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth/require-admin";

export async function requireSuperAdmin() {
  const admin = await requireAdmin();

  if (admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return admin;
}