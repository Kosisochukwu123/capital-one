import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "USER" | "ADMIN";
    requiresPinSetup: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      requiresPinSetup: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    requiresPinSetup: boolean;
  }
}