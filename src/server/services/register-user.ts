import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import {
  generateAccountNumber,
  generateCustomerId,
} from "@/lib/banking/identifiers";

import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";

export async function registerUser(
  input: RegisterInput
) {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid registration information.",
    };
  }

  const data = parsed.data;

  const existingUser = await db.user.findUnique({
    where: {
      email: data.email.toLowerCase(),
    },
  });

  if (existingUser) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    12
  );

  let customerId = generateCustomerId();

  while (
    await db.user.findUnique({
      where: { customerId },
    })
  ) {
    customerId = generateCustomerId();
  }

  let checkingAccountNumber =
    generateAccountNumber();

  while (
    await db.account.findUnique({
      where: {
        accountNumber: checkingAccountNumber,
      },
    })
  ) {
    checkingAccountNumber =
      generateAccountNumber();
  }

  let savingsAccountNumber =
    generateAccountNumber();

  while (
    savingsAccountNumber === checkingAccountNumber ||
    (await db.account.findUnique({
      where: {
        accountNumber: savingsAccountNumber,
      },
    }))
  ) {
    savingsAccountNumber =
      generateAccountNumber();
  }

  const dateOfBirth = new Date(
    `${data.dateOfBirth}T00:00:00.000Z`
  );

  const user = await db.$transaction(
    async (tx) => {
      return tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          customerId,

          profile: {
            create: {
              firstName: data.firstName,
              middleName:
                data.middleName || null,
              lastName: data.lastName,

              dateOfBirth,
              phone: data.phone,

              country: data.country,
              state: data.state,
              city: data.city,
              address: data.address,
              postalCode:
                data.postalCode || null,
            },
          },

          securitySettings: {
            create: {},
          },

          accounts: {
            create: [
              {
                type: "CHECKING",
                accountNumber:
                  checkingAccountNumber,
                currency: "USD",
                balance: 0,
                status: "ACTIVE",
              },
              {
                type: "SAVINGS",
                accountNumber:
                  savingsAccountNumber,
                currency: "USD",
                balance: 0,
                status: "ACTIVE",
              },
            ],
          },

          activityLogs: {
            create: {
              action: "ACCOUNT_REGISTERED",
              description:
                "User completed registration.",
            },
          },
        },

        select: {
          id: true,
          email: true,
          customerId: true,
          requiresPinSetup: true,
        },
      });
    }
  );

  return {
    success: true,
    user,
  };
}