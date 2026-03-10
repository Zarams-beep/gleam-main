// app/api/auth/[...nextauth]/route.ts
// ─── NextAuth now delegates credential checks to the Express backend ──────────
// This means there is ONE source of truth: Neon PostgreSQL via the Express API.
// MongoDB/mongoose is no longer used for auth.
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          // ✅ Call Express backend — single source of truth (Neon PostgreSQL)
          const res = await fetch(`${BACKEND}/api/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            // Surface the real error message from the backend (e.g. "Invalid email or password.")
            throw new Error(data?.error || "Login failed.");
          }

          // ✅ Return the user object — NextAuth stores this in the JWT
          return {
            id:         data.user.id,
            email:      data.user.email,
            fullName:   data.user.fullName,
            image:      data.user.image  ?? null,
            orgId:      data.user.orgId  ?? null,
            role:       data.user.role   ?? "member",
            department: data.user.department ?? null,
            // Store the Express JWT so frontend API calls can use it
            accessToken: data.token,
          };
        } catch (err: any) {
          console.error("NextAuth authorize error:", err.message);
          throw new Error(err.message || "Login failed.");
        }
      },
    }),

    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GithubProvider({
      clientId:     process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, `user` is populated — persist everything into the token
      if (user) {
        token.id          = user.id;
        token.fullName    = (user as any).fullName    || user.name;
        token.image       = user.image                ?? null;
        token.orgId       = (user as any).orgId       ?? null;
        token.role        = (user as any).role        ?? "member";
        token.department  = (user as any).department  ?? null;
        token.accessToken = (user as any).accessToken ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id          = token.id         as string;
        session.user.fullName    = token.fullName   as string;
        session.user.image       = token.image      as string | null;
        session.user.orgId       = token.orgId      as string | null;
        session.user.role        = token.role       as string;
        session.user.department  = token.department as string | null;
        session.user.accessToken = token.accessToken as string | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",   // redirect auth errors back to login page (not /api/auth/error)
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
