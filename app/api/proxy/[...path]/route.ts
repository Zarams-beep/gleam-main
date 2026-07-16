// app/api/proxy/[...path]/route.ts
// BFF proxy: the browser only ever talks to this same-origin route. The
// Express JWT lives solely in the httpOnly NextAuth session cookie on this
// server and is attached to the backend request here — it never reaches
// client-side JS, localStorage, or the browser's network tab as a bearer
// token the page itself could read.
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  // getToken() decrypts the session cookie directly and returns the full JWT
  // payload (including accessToken) — unlike getServerSession(), it doesn't
  // round-trip through the session() callback, which deliberately strips
  // accessToken before anything reaches the client.
  const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const sessionToken = jwt?.accessToken as string | null | undefined;

  // Sign-up flow calls this before the NextAuth session exists yet (it has a
  // token straight from /api/auth/register but hasn't signed in via NextAuth
  // in the background). Letting a caller pass that token explicitly for just
  // that window preserves the existing frontend flow without reintroducing
  // localStorage as a general-purpose token store.
  const explicitToken = req.headers.get("x-gleam-token");
  const token = explicitToken || sessionToken;

  const targetUrl = `${BACKEND}/${path.join("/")}${req.nextUrl.search}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: RequestInit = { method: req.method, headers };
  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = await req.text();
  }

  try {
    const res = await fetch(targetUrl, init);
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    console.error("Proxy request failed:", err);
    return NextResponse.json({ error: "Unable to reach the server. Please try again." }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
