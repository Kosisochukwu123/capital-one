"use server";

import bcrypt from "bcryptjs";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export async function loginAction(values: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid login information.",
    };
  }

  const email = parsed.data.email.toLowerCase();

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });

    const user = await db.user.findUnique({
      where: {
        email,
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

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
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

    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        passwordHash: true,
        status: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Incorrect email address or password.",
      };
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return {
        success: false,
        error: "Incorrect email address or password.",
      };
    }

    if (user.status === "SUSPENDED") {
      return {
        success: false,
        error:
          "Your account has been suspended. Please contact support for assistance.",
      };
    }

    if (user.status === "PENDING") {
      return {
        success: false,
        error:
          "Your account is awaiting activation. Please contact support if you need assistance.",
      };
    }

    if (user.status === "CLOSED") {
      return {
        success: false,
        error:
          "This account is no longer active. Please contact support for assistance.",
      };
    }

    return {
      success: false,
      error: "Incorrect email address or password.",
    };
  }
}
