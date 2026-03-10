// ─── Auth / user form types ───────────────────────────────────────────────────
interface SignupState {
  signupLoading: boolean;
  signupSuccess: boolean;
  signupError: string | null;
  signinLoading: boolean;
  signinSuccess: boolean;
  signinError: string | null;
  isAuthenticated: boolean;
}

export type SignUpFormData = {
  fullName: string;
  image?: File | null;
  email: string;
  password: string;
};

export type SignUpSubmitFormData = {
  fullName: string;
  image?: string | null;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: "super_admin" | "admin" | "org_admin" | "hr" | "employee" | "member";
};

export type LoginFormData = {
  email: string;
  password: string;
  saveDetails?: boolean;
};

export type ContactUsFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message?: string;
};

export type { SignupState };

// ─── Gleam domain types ───────────────────────────────────────────────────────

export type OrgType = "workplace" | "school";

export type Department = {
  id: string;
  name: string;
  description: string;
  member_count: number;
};

export type GleamUser = {
  id: string;
  fullName: string;
  email: string;
  image: string | null;
  orgType: OrgType | null;
  orgId: string | null;
  department: string | null;
  role: "super_admin" | "admin" | "org_admin" | "hr" | "employee" | "member";
  stats: UserStats;
};

export type UserStats = {
  coins: number;
  streak: number;
  performance: number;
  totalSent: number;
  totalReceived: number;
  unreadCompliments?: number;
  activeDaysThisMonth?: number;
  hasSentToday?: boolean;
  coinsEarnedToday?: number;
  lastActive?: string | null;
};

export type Organization = {
  id: string;
  name: string;
  orgType: OrgType;
  inviteCode: string;
  departments: Department[];
  members?: OrgMember[];
  is_active: boolean;
};

export type OrgMember = {
  id: string;
  full_name: string;
  email: string;
  image: string | null;
  department: string | null;
  coins: number;
  streak: number;
  performance: number;
};

export type Compliment = {
  id: string;
  content: string;
  department: string;
  status: "delivered" | "pending" | "flagged" | "rejected";
  is_read: boolean;
  read_at: string | null;
  reaction: "❤️" | "😊" | "🙌" | "✨" | null;
  created_at: string;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  fullName: string;
  image: string | null;
  department: string | null;
  complimentsSent: number;
  coins: number;
  streak: number;
  isCurrentUser: boolean;
};

export type DeptLeaderboardEntry = {
  rank: number;
  department: string;
  totalCompliments: number;
  activeMembers: number;
};
