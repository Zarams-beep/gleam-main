"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BlogEditor from "@/component/Blog/BlogEditor";
import { blogApi } from "@/utils/api";
import { BlogPost } from "@/component/Blog/blogUtils";
import "@/styles/Blog.css";

export default function EditBlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const res: any = await blogApi.get(slug);
        if (cancelled) return;
        const viewerId = (session?.user as any)?.id;
        if (res.post.author.id !== viewerId) {
          setForbidden(true);
        } else {
          setPost(res.post);
        }
      } catch {
        if (!cancelled) setForbidden(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, status, session]);

  if (status === "loading" || status === "unauthenticated" || loading) return null;

  if (forbidden || !post) {
    return (
      <div className="blog-page">
        <div className="blog-empty">
          <h3>Can't edit this story</h3>
          <p>Either it doesn't exist, or it belongs to someone else.</p>
          <Link href="/blog/mine" className="blog-btn blog-btn-primary">Back to My Posts</Link>
        </div>
      </div>
    );
  }

  return <BlogEditor mode="edit" postId={post.id} initial={post} />;
}
