// component/Blog/blogUtils.ts
// Small shared helpers for the blog components — kept dependency-free
// (no date-fns/dayjs in this project) since the formatting need is trivial.

export const initials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "");
};

export const formatRelative = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export interface BlogAuthor {
  id: string;
  fullName: string;
  image?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage: string | null;
  status: "draft" | "published";
  readTimeMinutes: number;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  likedByViewer?: boolean;
  author: BlogAuthor;
  // Coin-gated reads — see gleam-backend/controllers/postController.js.
  // `locked` is only meaningful on the single-post detail response (the list
  // endpoint never includes full content anyway); `unlockCost` is included
  // whenever `locked` is present so the UI never has to hardcode the price.
  locked?: boolean;
  unlockCost?: number;
}

export interface BlogComment {
  id: string;
  content: string;
  createdAt: string;
  author: BlogAuthor;
}
