// lib/auth.ts
// NextAuth config, extracted out of the route handler so server-side code
// (e.g. app/api/proxy/[...path]/route.ts) can call getServerSession(authOptions)
// without importing a route module.
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// The Express access token is a 15-minute JWT (see gleam-backend/controllers/
// authController.js ACCESS_TOKEN_TTL). Decode its `exp` claim (no signature
// verification needed here — we're just reading a timestamp to know when to
// proactively refresh, the backend re-verifies the signature on every call)
// so refresh timing tracks the real token instead of a hardcoded duration
// that could drift out of sync with the backend.
function decodeJwtExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Exchanges the refresh token for a new access token via the existing-but-
// previously-unused POST /api/auth/refresh endpoint. Called from the jwt
// callback below whenever the access token is at/near expiry, so a session
// doesn't just silently start failing backend calls after 15 minutes.
async function refreshAccessToken(token: any) {
  try {
    if (!token.refreshToken) throw new Error("No refresh token available.");

    const res = await fetch(`${BACKEND}/api/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken: token.refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to refresh token.");

    return {
      ...token,
      accessToken:        data.accessToken || data.token,
      accessTokenExpires: decodeJwtExpiryMs(data.accessToken || data.token) ?? Date.now() + 15 * 60 * 1000,
      error:              undefined,
    };
  } catch (err) {
    console.error("refreshAccessToken error:", err);
    // Surfaced via session.error — the client (dashboard layout) signs the
    // user out cleanly instead of limping along with a dead access token
    // that would otherwise show raw "Token is invalid or expired." errors
    // bubbling up out of random dashboard widgets.
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
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
            // Store the Express JWT so backend calls (via the proxy route) can use it
            accessToken:  data.token,
            // Kept so the jwt callback can silently mint a new access token
            // instead of the session just dying 15 minutes after login.
            refreshToken: data.refreshToken ?? null,
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
    async jwt({ token, user, account, profile }) {
      // Credentials login — `user` already carries the Express JWT.
      if (user && account?.provider === "credentials") {
        token.id                  = user.id;
        token.fullName            = (user as any).fullName    || user.name;
        token.image               = user.image                ?? null;
        token.orgId               = (user as any).orgId       ?? null;
        token.role                = (user as any).role        ?? "member";
        token.department          = (user as any).department  ?? null;
        token.accessToken         = (user as any).accessToken ?? null;
        token.refreshToken        = (user as any).refreshToken ?? null;
        token.accessTokenExpires  = token.accessToken ? decodeJwtExpiryMs(token.accessToken as string) : null;
        token.error               = undefined;
        return token;
      }

      // Google/GitHub OAuth — `account` is only present on the first sign-in.
      // There is no Express JWT yet, so sync-or-create the Gleam user record
      // and mint one via a trusted server-to-server call.
      if (account && (account.provider === "google" || account.provider === "github")) {
        try {
          const res = await fetch(`${BACKEND}/api/auth/oauth-sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-Secret": process.env.INTERNAL_API_SECRET || "",
            },
            body: JSON.stringify({
              email:    profile?.email ?? user?.email,
              fullName: profile?.name  ?? user?.name ?? "Gleam User",
              image:    (profile as any)?.picture ?? (profile as any)?.avatar_url ?? user?.image ?? null,
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            token.error       = data?.error || "OAuth sign-in failed.";
            token.accessToken = null;
            return token;
          }

          token.id                 = data.user.id;
          token.fullName           = data.user.fullName;
          token.image              = data.user.image ?? null;
          token.orgId              = data.user.orgId ?? null;
          token.role               = data.user.role  ?? "member";
          token.department         = data.user.department ?? null;
          token.accessToken        = data.token;
          token.refreshToken       = data.refreshToken ?? null;
          token.accessTokenExpires = decodeJwtExpiryMs(data.token);
          token.error              = undefined;
        } catch (err) {
          console.error("OAuth sync error:", err);
          token.error       = "OAuth sign-in failed. Please try again.";
          token.accessToken = null;
        }

        return token;
      }

      // ── Subsequent calls (every session check) ──────────────────────────
      // No `user`/`account` here — this is just NextAuth re-reading the
      // already-issued token. Refresh proactively (1-minute safety buffer)
      // instead of waiting for the backend to reject an expired token mid-
      // request, which is what used to surface as a raw "Token is invalid or
      // expired." string inside dashboard widgets.
      if (!token.accessToken) return token;
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 60_000) {
        return token;
      }
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Deliberately NOT copying token.accessToken onto session.user here —
      // this callback also backs useSession()/getSession() on the client, so
      // anything set on session.user is readable by client-side JS. The
      // Express JWT stays inside the encrypted token/cookie; only the proxy
      // route (via next-auth/jwt's getToken(), server-only) can read it.
      if (session.user) {
        session.user.id          = token.id         as string;
        session.user.fullName    = token.fullName   as string;
        session.user.image       = token.image      as string | null;
        session.user.orgId       = token.orgId      as string | null;
        session.user.role        = token.role       as string;
        session.user.department  = token.department as string | null;
      }
      session.error = token.error as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",   // redirect auth errors back to login page (not /api/auth/error)
  },

  secret: process.env.NEXTAUTH_SECRET,
};
