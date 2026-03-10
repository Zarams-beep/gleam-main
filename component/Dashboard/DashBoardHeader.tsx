// component/Dashboard/DashBoardHeader.tsx
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  super_admin: { label: "Super Admin", bg: "#fee2e2", color: "#dc2626" },
  admin:       { label: "Admin",       bg: "#ffedd5", color: "#ea580c" },
  org_admin:   { label: "Org Admin",   bg: "#ede9fe", color: "#7c3aed" },
  hr:          { label: "HR",          bg: "#dbeafe", color: "#2563eb" },
  employee:    { label: "Employee",    bg: "#d1fae5", color: "#059669" },
  member:      { label: "Member",      bg: "#f3f4f6", color: "#6b7280" },
};

export default function DashBoardHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = useAppSelector((s) => s.user.user);
  const org  = useAppSelector((s) => s.org.org);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <section className="dashboard-after-header">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-subtitle" />
      </section>
    );
  }

  if (!session) return null;

  const firstName  = (user?.fullName || session.user?.name || "there").split(" ")[0];
  const role        = user?.role ?? "member";
  const roleConf    = ROLE_CONFIG[role] ?? ROLE_CONFIG.member;
  const isSuperUser = ["super_admin", "admin"].includes(role);

  return (
    <motion.section
      className="dashboard-after-header"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {isSuperUser ? (
        /* ── Super Admin / Admin greeting ── */
        <>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
            <h1 style={{ margin: 0 }}>Welcome back, {firstName} 👑</h1>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, background: roleConf.bg, color: roleConf.color, borderRadius: 20, padding: "3px 10px" }}>
              {roleConf.label}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <p style={{ margin: 0, color: "#64748b" }}>You have full control of your workspace.</p>
            {org?.name && (
              <span style={{ fontSize: "0.78rem", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>
                🏢 {org.name}
              </span>
            )}
            {!user?.orgId && (
              <span onClick={() => router.push("/sign-up")} style={{ fontSize: "0.78rem", background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", borderRadius: 20, padding: "2px 10px", fontWeight: 600, cursor: "pointer" }}>
                ⚠️ No organisation yet
              </span>
            )}
            <span
              onClick={() => router.push("/dashboard/admin")}
              style={{ fontSize: "0.78rem", background: "#ede9fe", color: "#7c3aed", border: "1px solid #c4b5fd", borderRadius: 20, padding: "2px 10px", fontWeight: 600, cursor: "pointer" }}
            >
              🛡️ Open Command Centre →
            </span>
          </div>
        </>
      ) : (
        /* ── Regular user greeting ── */
        <>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
            <h1 style={{ margin: 0 }}>Hi {firstName} 👋</h1>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, background: roleConf.bg, color: roleConf.color, borderRadius: 20, padding: "3px 10px" }}>
              {roleConf.label}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <p style={{ margin: 0, color: "#64748b" }}>Keep shining — your kindness makes a difference ✨</p>
            {org?.name && (
              <span style={{ fontSize: "0.78rem", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>
                🏢 {org.name}
              </span>
            )}
            {user?.department && (
              <span style={{ fontSize: "0.78rem", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>
                📍 {user.department}
              </span>
            )}
            {!user?.orgId && (
              <span onClick={() => router.push("/onboarding")} style={{ fontSize: "0.78rem", background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", borderRadius: 20, padding: "2px 10px", fontWeight: 600, cursor: "pointer" }}>
                ⚠️ No organisation — join one
              </span>
            )}
          </div>
        </>
      )}
    </motion.section>
  );
}
