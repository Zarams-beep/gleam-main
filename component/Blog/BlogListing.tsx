"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FaPen, FaRegNewspaper, FaHeart, FaRegComment } from "react-icons/fa";
import "@/styles/Blog.css";
import { blogApi } from "@/utils/api";
import { BlogPost, formatRelative, initials } from "./blogUtils";

const PAGE_SIZE = 9;

export default function BlogListing() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    p === 1 ? setLoading(true) : setLoadingMore(true);
    setError(null);
    try {
      const res: any = await blogApi.list(p, PAGE_SIZE);
      setPosts((prev) => (p === 1 ? res.posts : [...prev, ...res.posts]));
      setPages(res.pagination?.pages || 1);
      setPage(p);
    } catch (err: any) {
      setError(err?.message || "Couldn't load posts. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="blog-page">
      <div className="blog-topbar">
        <div className="blog-topbar-title">
          <h1>Gleam Stories</h1>
          <p>Real notes from real teammates — wins, lessons, and everything in between.</p>
        </div>
        <div className="blog-topbar-actions">
          {isAuthed && (
            <Link href="/blog/mine" className="blog-btn blog-btn-secondary">My Posts</Link>
          )}
          <Link href="/blog/write" className="blog-btn blog-btn-primary">
            <FaPen size={13} /> {isAuthed ? "Write a post" : "Start writing"}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="blog-skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="blog-skeleton-card">
              <div className="blog-skeleton-cover" />
              <div className="blog-skeleton-line" style={{ width: "70%" }} />
              <div className="blog-skeleton-line" style={{ width: "90%" }} />
              <div className="blog-skeleton-line" style={{ width: "40%" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="blog-empty">
          <div className="blog-empty-icon"><FaRegNewspaper /></div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="blog-btn blog-btn-secondary" onClick={() => load(1)}>Try again</button>
        </div>
      ) : posts.length === 0 ? (
        <div className="blog-empty">
          <div className="blog-empty-icon"><FaRegNewspaper /></div>
          <h3>No stories yet</h3>
          <p>Be the first to share something with the Gleam community.</p>
          <Link href="/blog/write" className="blog-btn blog-btn-primary">
            <FaPen size={13} /> Write the first post
          </Link>
        </div>
      ) : (
        <>
          <div className="blog-grid">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-card-cover">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 768px) 100vw, 340px" style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="blog-card-cover-placeholder">{initials(post.title)}</div>
                  )}
                </div>
                <div className="blog-card-body">
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-meta">
                    <div className="blog-author-chip">
                      {post.author.image ? (
                        <img src={post.author.image} alt={post.author.fullName} className="blog-author-avatar" />
                      ) : (
                        <span className="blog-author-avatar-fallback">{initials(post.author.fullName)}</span>
                      )}
                      <span className="blog-author-name">{post.author.fullName}</span>
                    </div>
                    <div className="blog-card-stats">
                      <span><FaHeart size={10} /> {post.likeCount}</span>
                      <span><FaRegComment size={10} /> {post.commentCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {page < pages && (
            <div className="blog-loadmore-wrap">
              <button className="blog-btn blog-btn-secondary" disabled={loadingMore} onClick={() => load(page + 1)}>
                {loadingMore ? "Loading…" : "Load more stories"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
