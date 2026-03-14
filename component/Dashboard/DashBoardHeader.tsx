// component/Dashboard/DashBoardHeader.tsx
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { MdOutlineLocationOn, MdOutlineWarningAmber, MdOutlineAdminPanelSettings } from "react-icons/md";
import { RiShieldCheckLine } from "react-icons/ri";

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  super_admin: { label: "Super Admin", bg: "#fee2e2", color: "#dc2626" },
  admin:       { label: "Admin",       bg: "#ffedd5", color: "#ea580c" },
  org_admin:   { label: "Org Admin",   bg: "#ede9fe", color: "#7c3aed" },
  hr:          { label: "HR",          bg: "#dbeafe", color: "#2563eb" },
  employee:    { label: "Employee",    bg: "#d1fae5", color: "#059669" },
  member:      { label: "Member",      bg: "#f3f4f6", color: "#6b7280" },
};

const pillStyle = (bg: string, color: string, border: string, extra?: React.CSSProperties): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: "0.76rem", background: bg, color,
  border: `1px solid ${border}`, borderRadius: 20,
  padding: "2px 10px", fontWeight: 600,
  ...extra,
});

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
  const role       = user?.role ?? "member";
  const roleConf   = ROLE_CONFIG[role] ?? ROLE_CONFIG.member;
  const isSuperUser = ["super_admin", "admin"].includes(role);

  return (
    <motion.section
      className="dashboard-after-header"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {isSuperUser ? (
        <>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
            <h1 style={{ margin: 0 }}>Welcome back, {firstName}</h1>
            <span style={pillStyle(roleConf.bg, roleConf.color, roleConf.color + "44")}>
              <RiShieldCheckLine style={{ fontSize: 11 }} />
              {roleConf.label}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <p style={{ margin: 0, color: "#64748b" }}>You have full control of your workspace.</p>
            {org?.name && (
              <span style={pillStyle("#f0fdf4", "#16a34a", "#bbf7d0")}>
                <HiOutlineBuildingOffice2 style={{ fontSize: 12 }} />
                {org.name}
              </span>
            )}
            {!user?.orgId && (
              <span
                onClick={() => router.push("/sign-up")}
                style={pillStyle("#fef3c7", "#d97706", "#fde68a", { cursor: "pointer" })}
              >
                <MdOutlineWarningAmber style={{ fontSize: 12 }} />
                No organisation yet
              </span>
            )}
            <span
              onClick={() => router.push("/dashboard/admin")}
              style={pillStyle("#ede9fe", "#7c3aed", "#c4b5fd", { cursor: "pointer" })}
            >
              <MdOutlineAdminPanelSettings style={{ fontSize: 12 }} />
              Open Command Centre
            </span>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
            <h1 style={{ margin: 0 }}>Hi {firstName}</h1>
            <span style={pillStyle(roleConf.bg, roleConf.color, roleConf.color + "44")}>
              {roleConf.label}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <p style={{ margin: 0, color: "#64748b" }}>Keep shining. Your kindness makes a difference.</p>
            {org?.name && (
              <span style={pillStyle("#f0fdf4", "#16a34a", "#bbf7d0")}>
                <HiOutlineBuildingOffice2 style={{ fontSize: 12 }} />
                {org.name}
              </span>
            )}
            {user?.department && (
              <span style={pillStyle("#eff6ff", "#2563eb", "#bfdbfe")}>
                <MdOutlineLocationOn style={{ fontSize: 12 }} />
                {user.department}
              </span>
            )}
            {!user?.orgId && (
              <span
                onClick={() => router.push("/onboarding")}
                style={pillStyle("#fef3c7", "#d97706", "#fde68a", { cursor: "pointer" })}
              >
                <MdOutlineWarningAmber style={{ fontSize: 12 }} />
                No organisation — join one
              </span>
            )}
          </div>
        </>
      )}
    </motion.section>
  );
}
