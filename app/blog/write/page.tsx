"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BlogEditor from "@/component/Blog/BlogEditor";

export default function WriteBlogPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // The login page always redirects to /dashboard on success (it doesn't
    // honor a callback/next param), so there's nothing to gain from passing
    // one here — the user just re-navigates to /blog/write afterward.
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return null;

  return <BlogEditor mode="create" />;
}
