import connect from "@/utils/db";
import User from "@/modal/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";

export const runtime = "nodejs"; // 👈 ensures logging & bcrypt work

export const POST = async (req: Request) => {
  try {
    const { fullName, email, password, confirmPassword, image } = await req.json();

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    await connect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Upload image if provided
    let imageUrl: string | null = null;
    if (image) {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "user_profiles",
      });
      imageUrl = uploaded.secure_url;
    }

    // Save user
    const newUser = new User({
      fullName,
      email,
      password: hashed,
      image: imageUrl,
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error); // 👈 now will show in terminal/vercel
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
