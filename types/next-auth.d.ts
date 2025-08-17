// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      fullName?: string | null;
      email?: string | null;
      image?: string | null;
      saveDetails?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    fullName?: string | null;
    email: string;
    saveDetails?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    fullName?: string | null;
    saveDetails?: boolean;
    exp?: number; // JWT expiration
  }
}
