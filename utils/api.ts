/**
 * Gleam API client
 * All requests go through the same-origin /api/proxy route, which reads the
 * Express JWT server-side from the NextAuth session (httpOnly cookie) and
 * attaches it as a Bearer token to the backend request. The raw token never
 * reaches this client-side code, localStorage, or the browser's JS runtime.
 */

const PROXY_BASE = "/api/proxy";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function req<T = any>(
  path: string,
  options: RequestInit = {},
  explicitToken?: string  // used only for the brief window right after register,
                          // before the background NextAuth sign-in completes
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (explicitToken) headers["X-Gleam-Token"] = explicitToken;

  const res = await fetch(`${PROXY_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // A 401 this far into a session means the backend rejected the token
    // outright (expired refresh token, account deactivated, etc. — the
    // proactive refresh in lib/auth.ts's jwt callback handles the normal
    // 15-minute expiry before it ever gets here). Previously the raw backend
    // string (e.g. "Token is invalid or expired.") was thrown as-is and
    // rendered directly inside whatever widget made the call (see
    // DashboardLeaderboard.tsx). Instead, treat it as "the session is dead"
    // globally and send the user back to log in, rather than leaking a raw
    // auth error into random dashboard UI.
    if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?reason=session_expired";
      throw new Error("Your session has expired. Redirecting you to log in...");
    }
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    image?: string | null;
    role?: string;
    inviteCode?: string;
  }) => req("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    req("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  forgotPassword: (body: { email: string }) =>
    req("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),

  resetPassword: (body: { email: string; pin: string; newPassword: string }) =>
    req("/api/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),

  me: (token?: string) => req("/api/auth/me", {}, token),

  // Mints a short-lived (30s) single-purpose token used ONLY to authenticate
  // the socket.io handshake — the real, long-lived accessToken never leaves
  // this server-side proxy layer. See gleam-backend/controllers/authController.js.
  socketTicket: () => req<{ ticket: string }>("/api/auth/socket-ticket", { method: "POST" }),
};

// ─── Org ──────────────────────────────────────────────────────────────────────
export const orgApi = {
  create: (body: { name: string; orgType: string; departments?: { name: string }[] }, token?: string) =>
    req("/api/org/create", { method: "POST", body: JSON.stringify(body) }, token),

  join: (body: { inviteCode: string; department?: string }) =>
    req("/api/org/join", { method: "POST", body: JSON.stringify(body) }),

  lookup: (code: string) => req(`/api/org/lookup/${code}`),

  search: (q: string) => req(`/api/org/search?q=${encodeURIComponent(q)}`),

  me: () => req("/api/org/me"),

  presets: (orgType: "workplace" | "school") =>
    req(`/api/org/presets/${orgType}`),

  departmentMembers: (dept: string) =>
    req(`/api/org/department/${encodeURIComponent(dept)}/members`),

  updateDepartment: (department: string) =>
    req("/api/org/department", { method: "PATCH", body: JSON.stringify({ department }) }),

  // Manual bank-transfer billing flow (no payment gateway integrated) — see
  // gleam-backend/controllers/billingController.js. Deliberately reachable
  // even when the org's trial/plan has lapsed (unlike the rest of orgApi's
  // write routes), since this is exactly how an expired org gets unblocked.
  billing: () => req("/api/org/billing"),

  markPaid: (note?: string) =>
    req("/api/org/billing/mark-paid", { method: "POST", body: JSON.stringify({ note }) }),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userApi = {
  profile: () => req("/api/user/profile"),

  update: (body: { fullName?: string; image?: string }) =>
    req("/api/user/profile", { method: "PATCH", body: JSON.stringify(body) }),

  deleteAccount: (password: string) =>
    req("/api/user/account", { method: "DELETE", body: JSON.stringify({ password }) }),

  search: (q?: string, department?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (department) params.set("department", department);
    return req(`/api/user/search?${params.toString()}`);
  },
};

// ─── Compliment ───────────────────────────────────────────────────────────────
export const complimentApi = {
  send: (body: { recipientId: string; content: string }) =>
    req("/api/compliment/send", { method: "POST", body: JSON.stringify(body) }),

  received: (page = 1, limit = 10) =>
    req(`/api/compliment/received?page=${page}&limit=${limit}`),

  sent: (page = 1, limit = 10) =>
    req(`/api/compliment/sent?page=${page}&limit=${limit}`),

  today: () => req("/api/compliment/today"),

  react: (id: string, reaction: string) =>
    req(`/api/compliment/${id}/react`, {
      method: "PATCH",
      body: JSON.stringify({ reaction }),
    }),
};

// ─── Stats ────────────────────────────────────────────────────────────────────
export const statsApi = {
  me: () => req("/api/stats/me"),
  org: () => req("/api/stats/org"),
};

// ─── Fortune ──────────────────────────────────────────────────────────────────
export const fortuneApi = {
  today: () => req("/api/fortune/today"),
  random: () => req("/api/fortune/random"),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messageApi = {
  conversations: () => req("/api/message/conversations"),

  start: (recipientId: string) =>
    req("/api/message/conversations", { method: "POST", body: JSON.stringify({ recipientId }) }),

  messages: (conversationId: string, opts?: { before?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (opts?.before) params.set("before", opts.before);
    if (opts?.limit) params.set("limit", String(opts.limit));
    const qs = params.toString();
    return req(`/api/message/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`);
  },

  send: (conversationId: string, content: string) =>
    req(`/api/message/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  markRead: (conversationId: string) =>
    req(`/api/message/conversations/${conversationId}/read`, { method: "POST" }),

  // Call audit trail — every ring/accept/reject/cancel/end for this
  // conversation. See gleam-backend/models/CallLog.js.
  callLogs: (conversationId: string) =>
    req(`/api/message/conversations/${conversationId}/calls`),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  pending:      () => req("/api/admin/pending"),
  members:      () => req("/api/admin/members"),
  approve: (userId: string, body: { role: string; department?: string }) =>
    req(`/api/admin/approve/${userId}`, { method: "POST", body: JSON.stringify(body) }),
  reject: (userId: string, body: { reason?: string }) =>
    req(`/api/admin/reject/${userId}`, { method: "POST", body: JSON.stringify(body) }),
  updateMember: (userId: string, body: { role?: string; department?: string }) =>
    req(`/api/admin/member/${userId}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Platform-wide fortune cookie pool — super_admin only (see
  // gleam-backend/controllers/adminController.js).
  fortunes: {
    list: () => req("/api/admin/fortunes"),
    create: (text: string, category?: string) =>
      req("/api/admin/fortunes", { method: "POST", body: JSON.stringify({ text, category }) }),
    setActive: (id: string, isActive: boolean) =>
      req(`/api/admin/fortunes/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  },
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const leaderboardApi = {
  individual: (department?: string, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (department) params.set("department", department);
    return req(`/api/leaderboard?${params.toString()}`);
  },
  departments: () => req("/api/leaderboard/departments"),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
// Public reads need no session; write/like/comment routes require one. Any
// signed-in Gleam user (any org, or none) can author a post — see
// gleam-backend/routes/postRoutes.js.
export const blogApi = {
  list: (page = 1, limit = 10) =>
    req(`/api/posts?page=${page}&limit=${limit}`),

  mine: () => req("/api/posts/mine"),

  get: (slug: string) => req(`/api/posts/${slug}`),

  create: (body: { title: string; content: string; excerpt?: string; coverImage?: string | null; status?: "draft" | "published" }) =>
    req("/api/posts", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ title: string; content: string; excerpt: string; coverImage: string | null; status: "draft" | "published" }>) =>
    req(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  remove: (id: string) => req(`/api/posts/${id}`, { method: "DELETE" }),

  // Coin-gated read — see gleam-backend/controllers/postController.js
  // (BLOG_UNLOCK_COST). Flat price per post, charged once per reader.
  unlock: (id: string) =>
    req<{ message: string; content: string; newCoinBalance?: number }>(`/api/posts/${id}/unlock`, { method: "POST" }),

  toggleLike: (id: string) => req<{ liked: boolean; likeCount: number }>(`/api/posts/${id}/like`, { method: "POST" }),

  addComment: (id: string, content: string) =>
    req(`/api/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ content }) }),

  deleteComment: (postId: string, commentId: string) =>
    req(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),
};
