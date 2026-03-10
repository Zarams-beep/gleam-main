// app/api/auth/register/route.ts
// ─── Registration now delegates to the Express backend (NeonDB/PostgreSQL) ────
// MongoDB/Mongoose is no longer used.
import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { fullName, email, password, confirmPassword, image, role } = body;

    // Basic validation on the frontend route before hitting the backend
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // ✅ Forward registration to Express backend — single source of truth (NeonDB)
    const res = await fetch(`${BACKEND}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, confirmPassword, image, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Registration failed." },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
