"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerAccess } from "@/server/auth/require-customer-access";

type UpdateCustomerBtcInput = {
  customerId: string;
  btcBalance: string;
  btcProgressPercent: number;
};

export async function updateCustomerBtc(
  input: UpdateCustomerBtcInput
) {
  const {
    customerId,
    btcBalance,
    btcProgressPercent,
  } = input;

  if (!customerId) {
    return {
      success: false,
      error: "Customer is required.",
    };
  }

  const balance = Number(btcBalance);

  if (
    !Number.isFinite(balance) ||
    balance < 0
  ) {
    return {
      success: false,
      error: "Enter a valid BTC balance.",
    };
  }

  if (
    !Number.isInteger(btcProgressPercent) ||
    btcProgressPercent < 0 ||
    btcProgressPercent > 100
  ) {
    return {
      success: false,
      error: "Percentage must be between 0 and 100.",
    };
  }

  try {
    const { admin, customer } =
      await requireCustomerAccess(customerId);

    const currentCustomer =
      await db.user.findUnique({
        where: {
          id: customer.id,
        },

        select: {
          id: true,
          role: true,
          btcBalance: true,
          btcProgressPercent: true,

          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },

          email: true,
        },
      });

    if (
      !currentCustomer ||
      currentCustomer.role !== "USER"
    ) {
      return {
        success: false,
        error: "Customer not found.",
      };
    }

    const customerName =
      currentCustomer.profile
        ? `${currentCustomer.profile.firstName} ${currentCustomer.profile.lastName}`.trim()
        : currentCustomer.email;

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: currentCustomer.id,
        },

        data: {
          btcBalance: btcBalance,
          btcProgressPercent,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "CUSTOMER_BTC_DISPLAY_UPDATED",
          targetType: "USER",
          targetId: currentCustomer.id,

          description: `Administrator updated BTC display information for ${customerName}.`,

          beforeData: {
            btcBalance:
              currentCustomer.btcBalance.toString(),

            btcProgressPercent:
              currentCustomer.btcProgressPercent,
          },

          afterData: {
            btcBalance,
            btcProgressPercent,
          },
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(
      `/admin/users/${currentCustomer.id}`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Update customer BTC error:",
      error
    );

    return {
      success: false,
      error:
        "You do not have permission to update this customer.",
    };
  }
}