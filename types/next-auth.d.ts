// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id:          string;
      fullName:    string;
      email:       string;
      image:       string | null;
      orgId:       string | null;
      role:        string;
      department:  string | null;
      accessToken: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    fullName:    string;
    orgId:       string | null;
    role:        string;
    department:  string | null;
    accessToken: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:          string;
    fullName:    string;
    image:       string | null;
    orgId:       string | null;
    role:        string;
    department:  string | null;
    accessToken: string | null;
  }
}
