"use server";

import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";

import { registerUser } from "@/server/services/register-user";

export async function registerAction(
  values: RegisterInput
) {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid registration information.",
    };
  }

  try {
    return await registerUser(parsed.data);
  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      error:
        "We couldn't create the account. Please try again.",
    };
  }
}