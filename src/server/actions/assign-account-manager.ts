"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";

export async function assignAccountManager(
  customerId: string,
  managerId: string | null,
) {
  const superAdmin = await requireSuperAdmin();

  if (!customerId) {
    return {
      success: false,
      error: "Customer is required.",
    };
  }

  try {
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
      return {
        success: false,
        error: "Customer not found.",
      };
    }

    if (customer.role !== "USER") {
      return {
        success: false,
        error: "Account managers can only be assigned to customer accounts.",
      };
    }

    if (managerId) {
      const manager = await db.user.findUnique({
        where: {
          id: managerId,
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!manager) {
        return {
          success: false,
          error: "Account manager not found.",
        };
      }

      if (manager.role !== "ADMIN") {
        return {
          success: false,
          error: "The selected user is not an account manager.",
        };
      }

      if (manager.status !== "ACTIVE") {
        return {
          success: false,
          error: "The selected account manager is not active.",
        };
      }
    }

    if (customer.accountManagerId === managerId) {
      return {
        success: true,
      };
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: customer.id,
        },
        data: {
          accountManagerId: managerId,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: superAdmin.id,
          action: managerId
            ? "ACCOUNT_MANAGER_ASSIGNED"
            : "ACCOUNT_MANAGER_UNASSIGNED",
          targetType: "USER",
          targetId: customer.id,
          description: managerId
            ? "Super administrator assigned an account manager to the customer."
            : "Super administrator removed the customer's account manager.",
          beforeData: {
            accountManagerId: customer.accountManagerId,
          },
          afterData: {
            accountManagerId: managerId,
          },
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${customerId}`);
    revalidatePath("/admin/account-managers");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Assign account manager error:", error);

    return {
      success: false,
      error: "Unable to update the account manager.",
    };
  }
}
