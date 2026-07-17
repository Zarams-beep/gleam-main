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
    fullName:     string;
    orgId:        string | null;
    role:         string;
    department:   string | null;
    accessToken:  string | null;
    // Present on credentials/OAuth sign-in so the jwt callback can silently
    // mint a fresh access token instead of the session dying after 15 minutes.
    refreshToken?: string | null;
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
    refreshToken?:       string | null;
    accessTokenExpires?: number | null; // ms epoch — decoded from the access JWT's `exp` claim
    error?:      string;
  }
}
