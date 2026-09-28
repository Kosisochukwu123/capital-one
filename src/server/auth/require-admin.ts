import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const admin = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!admin || admin.status !== "ACTIVE") {
    redirect("/login");
  }

  if (admin.role !== "ADMIN") {
    redirect("/");
  }

  return admin;
}