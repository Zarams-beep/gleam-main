// app/api/auth/[...nextauth]/route.ts
// ─── NextAuth now delegates credential checks to the Express backend ──────────
// This means there is ONE source of truth: Neon PostgreSQL via the Express API.
// MongoDB/mongoose is no longer used for auth.
// Config lives in lib/auth.ts so server-side code elsewhere (e.g. the proxy
// route) can call getServerSession(authOptions) without importing this module.
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
