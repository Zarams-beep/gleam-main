/**
 * Gleam API client
 * Token is always read from gleam_access_token in localStorage.
 * Pass an explicit token to any function to bypass localStorage entirely.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Token reader ─────────────────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("gleam_access_token");
  } catch {
    return null;
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function req<T = any>(
  path: string,
  options: RequestInit = {},
  explicitToken?: string  // bypasses getToken() entirely when provided
): Promise<T> {
  const token = explicitToken ?? getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
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

  me: (token?: string) => req("/api/auth/me", {}, token),
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
