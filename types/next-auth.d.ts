import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    mobile?: string | null;
    role?: "CUSTOMER" | "ADMIN";
  }

  interface Session {
    user: {
      id: string;
      mobile?: string | null;
      role: "CUSTOMER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    mobile?: string | null;
    role?: "CUSTOMER" | "ADMIN";
  }
}
