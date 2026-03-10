// app/dashboard/profile/page.tsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store/hooks";
import { userApi } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { MdOutlineEmail, MdOutlineLocationOn, MdOutlineBadge } from "react-icons/md";
import { PiCoins, PiFireSimpleBold } from "react-icons/pi";
import { RiTeamFill } from "react-icons/ri";

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  super_admin: { label: "Super Admin", bg: "#fee2e2", color: "#dc2626" },
  admin:       { label: "Admin",       bg: "#ffedd5", color: "#ea580c" },
  org_admin:   { label: "Org Admin",   bg: "#ede9fe", color: "#7c3aed" },
  hr:          { label: "HR",          bg: "#dbeafe", color: "#2563eb" },
  employee:    { label: "Employee",    bg: "#d1fae5", color: "#059669" },
  member:      { label: "Member",      bg: "#f3f4f6", color: "#6b7280" },
};

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const user  = useAppSelector((s) => s.user.user);
  const stats = useAppSelector((s) => s.stats.stats);
  const org   = useAppSelector((s) => s.org.org);

  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(user?.fullName || session?.user?.name || "");
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const saveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await userApi.update({ fullName: name.trim() });
      await updateSession({ name: name.trim() });
      setEditing(false);
      showToast("Profile updated!");
    } catch (e: any) {
      showToast(e.message || "Failed to update", false);
    } finally {
      setSaving(false);
    }
  };

  const role     = user?.role ?? "member";
  const roleConf = ROLE_CONFIG[role] ?? ROLE_CONFIG.member;
  const initials = (user?.fullName || session?.user?.name || "U")
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const statCards = [
    { label: "Coins",     value: stats?.coins         ?? 0, icon: "🪙",  bg: "#fef9c3", color: "#a16207" },
    { label: "Streak",    value: `${stats?.streak ?? 0}d`, icon: "🔥",  bg: "#fff7ed", color: "#c2410c" },
    { label: "Sent",      value: stats?.totalSent     ?? 0, icon: "✉️",  bg: "#ede9fe", color: "#7c3aed" },
    { label: "Received",  value: stats?.totalReceived ?? 0, icon: "💌",  bg: "#fce7f3", color: "#db2777" },
    { label: "Performance", value: `${stats?.performance ?? 0}%`, icon: "📈", bg: "#d1fae5", color: "#059669" },
  ];

  return (
    <div style={{ padding: "1.75rem", maxWidth: 700, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 20, right: 20, zIndex: 9999,
              background: toast.ok ? "#1a1740" : "#dc2626",
              color: "#fff", borderRadius: 12, padding: "0.9rem 1.5rem",
              fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            }}
          >
            {toast.ok ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#fff", borderRadius: 20, padding: "2rem",
          boxShadow: "0 4px 24px rgba(91,80,232,0.08)",
          border: "1.5px solid #f0eeff", marginBottom: "1.5rem",
        }}
      >
        {/* Avatar + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
            background: user?.image ? "transparent" : "linear-gradient(135deg, #5b50e8, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem", fontWeight: 800, color: "#fff",
            border: "3px solid #ede9fe", overflow: "hidden",
            fontFamily: "'Sora', sans-serif",
          }}>
            {user?.image || session?.user?.image
              ? <Image src={user?.image || session?.user?.image!} alt="avatar" width={80} height={80} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              : initials
            }
          </div>

          {/* Name + edit */}
          <div style={{ flex: 1, minWidth: 180 }}>
            {editing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  style={{
                    fontSize: "1.1rem", fontWeight: 700, color: "#1a1740",
                    border: "2px solid #5b50e8", borderRadius: 10, padding: "6px 12px",
                    outline: "none", fontFamily: "'Sora', sans-serif",
                  }}
                />
                <button onClick={saveProfile} disabled={saving} style={{ background: "#5b50e8", color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
                  <FiCheck />
                </button>
                <button onClick={() => { setEditing(false); setName(user?.fullName || ""); }} style={{ background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
                  <FiX />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
                  {user?.fullName || session?.user?.name}
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  style={{ background: "#f5f3ff", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#5b50e8" }}
                >
                  <FiEdit2 size={14} />
                </button>
              </div>
            )}

            {/* Role badge */}
            <span style={{
              display: "inline-block", marginTop: 6,
              fontSize: "0.72rem", fontWeight: 700,
              background: roleConf.bg, color: roleConf.color,
              borderRadius: 20, padding: "3px 12px",
            }}>
              {roleConf.label}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <InfoRow icon={<MdOutlineEmail style={{ color: "#5b50e8" }} />} label="Email" value={user?.email || session?.user?.email || "—"} />
          {org?.name && <InfoRow icon={<RiTeamFill style={{ color: "#059669" }} />} label="Organisation" value={org.name} />}
          {user?.department && <InfoRow icon={<MdOutlineLocationOn style={{ color: "#2563eb" }} />} label="Department" value={user.department} />}
          <InfoRow icon={<MdOutlineBadge style={{ color: "#d97706" }} />} label="Account Status" value={
            user?.status === "approved" ? "✅ Active"
            : user?.status === "pending" ? "⏳ Pending Approval"
            : "❌ Rejected"
          } />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "#1a1740", marginBottom: "1rem", fontSize: "1rem" }}>
          Your Stats
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
          {statCards.map((s) => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 16, padding: "1.1rem 1rem",
              textAlign: "center", border: `1.5px solid ${s.color}22`,
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{s.icon}</div>
              <p style={{ fontWeight: 800, margin: 0, color: s.color, fontSize: "1.1rem", fontFamily: "'Sora', sans-serif" }}>
                {s.value}
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#faf9ff", borderRadius: 12 }}>
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 600, minWidth: 90 }}>{label}</span>
      <span style={{ fontSize: "0.9rem", color: "#1a1740", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
