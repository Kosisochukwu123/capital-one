import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: parsed.data.email.toLowerCase(),
          },
          include: {
            profile: true,
          },
        });

        if (!user) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : user.email,
          role: user.role,
          requiresPinSetup: user.requiresPinSetup,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        token.role =
          "role" in user
            ? user.role
            : "USER";

        token.requiresPinSetup =
          "requiresPinSetup" in user
            ? user.requiresPinSetup
            : false;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        session.user.role = token.role as
          | "USER"
          | "ADMIN";

        session.user.requiresPinSetup =
          token.requiresPinSetup as boolean;
      }

      return session;
    },
  },
});