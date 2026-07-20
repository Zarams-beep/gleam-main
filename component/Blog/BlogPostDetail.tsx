"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FaArrowLeft, FaHeart, FaRegHeart, FaRegComment, FaRegEye,
  FaPen, FaTrash, FaClock, FaLock, FaCoins,
} from "react-icons/fa";
import "@/styles/Blog.css";
import { blogApi } from "@/utils/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStats } from "@/store/slices/statsSlice";
import { BlogComment, BlogPost, formatRelative, initials } from "./blogUtils";

export default function BlogPostDetail({ slug }: { slug: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthed = status === "authenticated" && !!session;
  const viewerId = (session?.user as any)?.id as string | undefined;
  const dispatch = useAppDispatch();
  const stats = useAppSelector((s) => s.stats.stats);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liking, setLiking] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [deletingId, setDeletingId] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res: any = await blogApi.get(slug);
      setPost(res.post);
      setComments(res.comments || []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleLike = async () => {
    if (!isAuthed) { router.push("/login"); return; }
    if (!post || liking) return;
    setLiking(true);
    // Optimistic update — the toggle is cheap to reconcile if it fails.
    const prevLiked = !!post.likedByViewer;
    const prevCount = post.likeCount;
    setPost({ ...post, likedByViewer: !prevLiked, likeCount: prevLiked ? prevCount - 1 : prevCount + 1 });
    try {
      const res: any = await blogApi.toggleLike(post.id);
      setPost((p) => p ? { ...p, likedByViewer: res.liked, likeCount: res.likeCount } : p);
    } catch {
      setPost((p) => p ? { ...p, likedByViewer: prevLiked, likeCount: prevCount } : p);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const res: any = await blogApi.addComment(post.id, commentText.trim());
      setComments((prev) => [...prev, res.comment]);
      setPost((p) => p ? { ...p, commentCount: p.commentCount + 1 } : p);
      setCommentText("");
    } catch {
      // leave the draft text in place so nothing is lost
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPost((p) => p ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p);
    try {
      await blogApi.deleteComment(post.id, commentId);
    } catch {
      load(); // reconcile on failure
    }
  };

  const handleUnlock = async () => {
    if (!post) return;
    if (!isAuthed) { router.push("/login"); return; }
    setUnlocking(true);
    setUnlockError(null);
    try {
      const res = await blogApi.unlock(post.id);
      setPost((p) => p ? { ...p, content: res.content, locked: false } : p);
      if (typeof res.newCoinBalance === "number" && stats) {
        dispatch(setStats({ ...stats, coins: res.newCoinBalance }));
      }
    } catch (err: any) {
      setUnlockError(err?.message || "Couldn't unlock this post. Please try again.");
    } finally {
      setUnlocking(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!confirm("Delete this post? This can't be undone.")) return;
    setDeletingId(true);
    try {
      await blogApi.remove(post.id);
      router.push("/blog/mine");
    } catch {
      setDeletingId(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-skeleton-cover" style={{ height: 320, borderRadius: 20, marginBottom: 24 }} />
        <div className="blog-skeleton-line" style={{ width: "60%", height: 32, margin: "0 0 16px" }} />
        <div className="blog-skeleton-line" style={{ width: "100%" }} />
        <div className="blog-skeleton-line" style={{ width: "90%" }} />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="blog-page">
        <div className="blog-empty">
          <h3>Story not found</h3>
          <p>This post may have been removed or never existed.</p>
          <Link href="/blog" className="blog-btn blog-btn-primary">Back to Stories</Link>
        </div>
      </div>
    );
  }

  const isOwner = isAuthed && viewerId === post.author.id;

  return (
    <div className="blog-page">
      <Link href="/blog" className="blog-detail-back"><FaArrowLeft size={12} /> Back to Stories</Link>

      {post.status === "draft" && <span className="blog-draft-badge" style={{ marginBottom: 14 }}>DRAFT — only visible to you</span>}

      {post.coverImage && (
        <div className="blog-detail-cover">
          {/* Native img avoids next/image's fixed-domain config for arbitrary Cloudinary URLs at full width */}
          <img src={post.coverImage} alt={post.title} />
        </div>
      )}

      <h1 className="blog-detail-title">{post.title}</h1>

      <div className="blog-detail-meta">
        <div className="blog-detail-author">
          {post.author.image ? (
            <img src={post.author.image} alt={post.author.fullName} className="blog-detail-author-avatar" />
          ) : (
            <span className="blog-author-avatar-fallback" style={{ width: 44, height: 44, fontSize: "1rem" }}>{initials(post.author.fullName)}</span>
          )}
          <div>
            <p className="blog-detail-author-name">{post.author.fullName}</p>
            <p className="blog-detail-author-sub">
              {formatRelative(post.publishedAt || post.createdAt)} · <FaClock size={10} style={{ marginBottom: -1 }} /> {post.readTimeMinutes} min read · <FaRegEye size={10} style={{ marginBottom: -1 }} /> {post.viewCount}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="blog-detail-owner-actions">
            <Link href={`/blog/${post.slug}/edit`} className="blog-btn blog-btn-secondary"><FaPen size={11} /> Edit</Link>
            <button className="blog-btn blog-btn-danger" disabled={deletingId} onClick={handleDeletePost}><FaTrash size={11} /> Delete</button>
          </div>
        )}
      </div>

      {post.locked && post.excerpt && (
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#3a3660", margin: "0 0 0.5rem" }}>
          {post.excerpt}
        </p>
      )}

      {post.locked ? (
        <div
          style={{
            background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
            border: "1.5px solid #ddd6fe",
            borderRadius: 20, padding: "2.5rem 2rem",
            textAlign: "center", margin: "1.5rem 0",
          }}
        >
          <div style={{ fontSize: "2.25rem", color: "#7c3aed", marginBottom: 10 }}><FaLock /></div>
          <p style={{ fontWeight: 700, color: "#4c1d95", margin: "0 0 6px", fontSize: "1.05rem", fontFamily: "'Sora', sans-serif" }}>
            The rest of this story is locked
          </p>
          <p style={{ color: "#6d28d9", margin: "0 0 20px", fontSize: "0.88rem", lineHeight: 1.6 }}>
            Unlock the full read for {post.unlockCost ?? 3} coins — earned by sending compliments.
          </p>
          <button
            className="blog-btn blog-btn-primary"
            disabled={unlocking}
            onClick={handleUnlock}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <FaCoins size={13} />
            {unlocking ? "Unlocking…" : `Unlock for ${post.unlockCost ?? 3} coins`}
          </button>
          {unlockError && (
            <p style={{ marginTop: 12, fontSize: "0.82rem", color: "#dc2626" }}>{unlockError}</p>
          )}
          {!isAuthed && (
            <p style={{ marginTop: 12, fontSize: "0.8rem", color: "#7c6ef5" }}>
              <Link href="/login" style={{ color: "inherit", textDecoration: "underline" }}>Sign in</Link> to unlock and read.
            </p>
          )}
        </div>
      ) : (
        <div className="blog-article">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ""}</ReactMarkdown>
        </div>
      )}

      {post.status === "published" && (
        <>
          <div className="blog-engage-bar">
            <button
              className={`blog-like-btn ${post.likedByViewer ? "liked" : ""}`}
              onClick={handleLike}
              disabled={liking}
            >
              {post.likedByViewer ? <FaHeart size={13} /> : <FaRegHeart size={13} />} {post.likeCount}
            </button>
            <span className="blog-engage-stat"><FaRegComment size={13} /> {post.commentCount} comments</span>
          </div>

          <div className="blog-comments">
            <h3>Comments</h3>

            {isAuthed ? (
              <form className="blog-comment-form" onSubmit={handleComment}>
                <textarea
                  placeholder="Share your thoughts…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={1000}
                />
                <div>
                  <button type="submit" className="blog-btn blog-btn-primary" disabled={!commentText.trim() || postingComment}>
                    {postingComment ? "Posting…" : "Post comment"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="blog-comment-signin">
                <span>Sign in to join the conversation.</span>
                <Link href="/login" className="blog-btn blog-btn-secondary">Sign in</Link>
              </div>
            )}

            <div className="blog-comment-list">
              {comments.map((c) => (
                <div key={c.id} className="blog-comment-item">
                  {c.author.image ? (
                    <img src={c.author.image} alt={c.author.fullName} className="blog-comment-avatar" />
                  ) : (
                    <span className="blog-comment-avatar-fallback">{initials(c.author.fullName)}</span>
                  )}
                  <div className="blog-comment-body">
                    <div className="blog-comment-head">
                      <span className="blog-comment-name">{c.author.fullName}</span>
                      <span className="blog-comment-time">{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className="blog-comment-text">{c.content}</p>
                    {viewerId === c.author.id && (
                      <button className="blog-comment-delete" onClick={() => handleDeleteComment(c.id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p style={{ color: "var(--blog-muted)", fontSize: "0.88rem" }}>No comments yet — be the first to say something.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
