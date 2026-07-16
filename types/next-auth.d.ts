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
    } & DefaultSession["user"];
    // Set when an OAuth sign-in (Google/GitHub) fails to sync with the
    // Express backend (e.g. account pending/rejected) — no accessToken exists
    // in that case, so the client should show this and sign the user out.
    error?: string;
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
    error?:      string;
  }
}
