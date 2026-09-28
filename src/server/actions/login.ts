"use server";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export async function loginAction(values: {
  email: string;
  password: string;
}) {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid login information.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    const user = await db.user.findUnique({
      where: {
        email: parsed.data.email.toLowerCase(),
      },
      select: {
        id: true,
        role: true,
        requiresPinSetup: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Unable to load your account.",
      };
    }

    let redirectTo = "/";

    if (user.role === "ADMIN") {
      redirectTo = "/admin";
    } else if (user.requiresPinSetup) {
      redirectTo = "/setup/security";
    }

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      error: "Incorrect email address or password.",
    };
  }
}