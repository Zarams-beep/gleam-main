"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaPen, FaTrash, FaEye, FaRegNewspaper, FaHeart, FaRegComment } from "react-icons/fa";
import "@/styles/Blog.css";
import { blogApi } from "@/utils/api";
import { BlogPost, formatRelative } from "./blogUtils";

export default function MyPosts() {
  const { status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await blogApi.mine();
      setPosts(res.posts || []);
    } catch (err: any) {
      setError(err?.message || "Couldn't load your posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await blogApi.remove(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // leave it in the list — user can retry
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="blog-page">
      <div className="blog-topbar">
        <div className="blog-topbar-title">
          <h1>My Posts</h1>
          <p>Everything you've written, published and drafts alike.</p>
        </div>
        <div className="blog-topbar-actions">
          <Link href="/blog" className="blog-btn blog-btn-secondary">All Stories</Link>
          <Link href="/blog/write" className="blog-btn blog-btn-primary"><FaPen size={13} /> Write a post</Link>
        </div>
      </div>

      {loading ? (
        <div className="blog-mine-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="blog-skeleton-card" style={{ height: 80 }} />
          ))}
        </div>
      ) : error ? (
        <div className="blog-empty"><p>{error}</p></div>
      ) : posts.length === 0 ? (
        <div className="blog-empty">
          <div className="blog-empty-icon"><FaRegNewspaper /></div>
          <h3>You haven't written anything yet</h3>
          <p>Share a win, a lesson, or just something on your mind.</p>
          <Link href="/blog/write" className="blog-btn blog-btn-primary"><FaPen size={13} /> Write your first post</Link>
        </div>
      ) : (
        <div className="blog-mine-list">
          {posts.map((post) => (
            <div key={post.id} className="blog-mine-row">
              <div className="blog-mine-row-info">
                <p className="blog-mine-row-title">
                  {post.title}{" "}
                  {post.status === "draft" && <span className="blog-draft-badge">DRAFT</span>}
                </p>
                <div className="blog-mine-row-meta">
                  <span>{formatRelative(post.publishedAt || post.createdAt)}</span>
                  <span><FaEye size={11} style={{ marginBottom: -1 }} /> {post.viewCount}</span>
                  <span><FaHeart size={11} style={{ marginBottom: -1 }} /> {post.likeCount}</span>
                  <span><FaRegComment size={11} style={{ marginBottom: -1 }} /> {post.commentCount}</span>
                </div>
              </div>
              <div className="blog-mine-row-actions">
                {post.status === "published" && (
                  <Link href={`/blog/${post.slug}`} className="blog-btn blog-btn-ghost">View</Link>
                )}
                <Link href={`/blog/${post.slug}/edit`} className="blog-btn blog-btn-secondary"><FaPen size={11} /> Edit</Link>
                <button className="blog-btn blog-btn-danger" disabled={deletingId === post.id} onClick={() => handleDelete(post.id)}>
                  <FaTrash size={11} /> {deletingId === post.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
