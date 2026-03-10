// app/dashboard/admin/page.tsx  ← Super Admin Command Center
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { adminApi, orgApi, statsApi } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MdAdminPanelSettings, MdPeople, MdOutlinePendingActions,
  MdOutlineBusinessCenter, MdOutlineBarChart, MdOutlineSettings,
} from "react-icons/md";
import { FiCopy, FiCheck, FiUsers, FiArrowRight, FiUserPlus } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { RiShieldStarFill } from "react-icons/ri";
import { FaUserCheck, FaUserTimes, FaUserCog, FaCrown } from "react-icons/fa";
import { orgApi as orgApiImport } from "@/utils/api";

const ROLES = ["member", "employee", "hr", "org_admin", "admin"];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  super_admin: { bg: "#fee2e2", color: "#dc2626" },
  admin:       { bg: "#ffedd5", color: "#ea580c" },
  org_admin:   { bg: "#ede9fe", color: "#7c3aed" },
  hr:          { bg: "#dbeafe", color: "#2563eb" },
  employee:    { bg: "#d1fae5", color: "#059669" },
  member:      { bg: "#f3f4f6", color: "#6b7280" },
};

type PendingUser = { id: string; full_name: string; email: string; image: string | null; role: string; status: string; created_at: string };
type Member      = PendingUser & { department: string | null };

export default function SuperAdminDashboard() {
  const user   = useAppSelector((s) => s.user.user);
  const org    = useAppSelector((s) => s.org.org);
  const router = useRouter();

  const isAdmin = ["super_admin", "admin", "org_admin"].includes(user?.role ?? "");

  const [activeTab, setActiveTab]       = useState<"overview" | "pending" | "members" | "org">("overview");
  const [pending, setPending]           = useState<PendingUser[]>([]);
  const [members, setMembers]           = useState<Member[]>([]);
  const [orgData, setOrgData]           = useState<any>(null);
  const [orgStats, setOrgStats]         = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [approveForm, setApproveForm]   = useState<Record<string, { role: string; dept: string }>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [processing, setProcessing]     = useState<string | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    // Give Redux 300ms to hydrate from persist before checking role
    const t = setTimeout(() => {
      if (!isAdmin) { router.replace("/dashboard"); return; }
      loadAll();
    }, 300);
    return () => clearTimeout(t);
  }, [isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, oRes, sRes] = await Promise.allSettled([
        adminApi.pending(),
        adminApi.members(),
        orgApiImport.me().catch(() => null),
        statsApi.org().catch(() => null),
      ]);
      if (pRes.status === "fulfilled") setPending(pRes.value.pending ?? []);
      if (mRes.status === "fulfilled") setMembers(mRes.value.members ?? []);
      if (oRes.status === "fulfilled") setOrgData(oRes.value?.org ?? null);
      if (sRes.status === "fulfilled") setOrgStats(sRes.value?.stats ?? null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (userId: string) => {
    const form = approveForm[userId] ?? { role: "member", dept: "" };
    setProcessing(userId);
    try {
      await adminApi.approve(userId, { role: form.role, department: form.dept || undefined });
      setPending((p) => p.filter((u) => u.id !== userId));
      showToast("✅ User approved and notified!");
      loadAll();
    } catch (e: any) { showToast("❌ " + (e.message || "Failed"), "error"); }
    finally { setProcessing(null); }
  };

  const handleReject = async (userId: string) => {
    setProcessing(userId);
    try {
      await adminApi.reject(userId, { reason: rejectReason[userId] || "" });
      setPending((p) => p.filter((u) => u.id !== userId));
      showToast("User rejected and notified.");
      loadAll();
    } catch (e: any) { showToast("❌ " + (e.message || "Failed"), "error"); }
    finally { setProcessing(null); }
  };

  const handleUpdateMember = async (userId: string) => {
    const form = approveForm[userId];
    if (!form) return;
    setProcessing(userId);
    try {
      await adminApi.updateMember(userId, { role: form.role || undefined, department: form.dept || undefined });
      showToast("✅ Member updated.");
      loadAll(); setExpanded(null);
    } catch (e: any) { showToast("❌ " + (e.message || "Failed"), "error"); }
    finally { setProcessing(null); }
  };

  const copyInvite = () => {
    const code = orgData?.invite_code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const orgDepts = (orgData?.departments ?? []).map((d: any) => d.name).filter(Boolean);

  const roleBadge = (role: string) => {
    const c = ROLE_COLORS[role] ?? ROLE_COLORS.member;
    return (
      <span style={{ fontSize: "0.7rem", fontWeight: 700, background: c.bg, color: c.color, borderRadius: 20, padding: "2px 9px" }}>
        {role.replace("_", " ")}
      </span>
    );
  };

  if (!isAdmin) return null;

  // ── Stats cards
  const statCards = [
    { label: "Total Members",   value: members.length,                icon: "👥", color: "#5b50e8", bg: "#ede9fe" },
    { label: "Pending Approval",value: pending.length,                icon: "⏳", color: pending.length > 0 ? "#d97706" : "#059669", bg: pending.length > 0 ? "#fef3c7" : "#d1fae5" },
    { label: "Departments",     value: orgDepts.length,               icon: "🏢", color: "#2563eb", bg: "#dbeafe" },
    { label: "Org Performance", value: orgStats?.avgPerformance != null ? `${orgStats.avgPerformance}%` : "—", icon: "📊", color: "#7c3aed", bg: "#ede9fe" },
  ];

  const tabs = [
    { id: "overview", label: "Overview",  icon: <MdOutlineBarChart size={16} /> },
    { id: "pending",  label: `Pending (${pending.length})`, icon: <MdOutlinePendingActions size={16} /> },
    { id: "members",  label: `Members (${members.length})`, icon: <MdPeople size={16} /> },
    { id: "org",      label: "Organisation", icon: <HiOutlineBuildingOffice2 size={16} /> },
  ] as const;

  return (
    <div style={{ padding: "1.75rem", fontFamily: "'DM Sans', sans-serif", maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 24, left: "50%", zIndex: 99999,
              background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
              color: toast.type === "error" ? "#dc2626" : "#16a34a",
              border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
              borderRadius: 12, padding: "0.75rem 1.5rem",
              fontWeight: 700, fontSize: "0.9rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #1a1740, #3d37a8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(26,23,64,0.30)",
          }}>
            <RiShieldStarFill style={{ color: "#fff", fontSize: 22 }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.55rem", fontWeight: 800, margin: 0, color: "#1a1740", letterSpacing: "-0.02em" }}>
                Command Centre
              </h1>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#fee2e2", color: "#dc2626", borderRadius: 20, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <FaCrown style={{ fontSize: 10 }} /> {user?.role === "super_admin" ? "Super Admin" : "Admin"}
              </span>
            </div>
            <p style={{ margin: 0, color: "#7b77a8", fontSize: "0.88rem" }}>
              {orgData?.name ?? "Your Organisation"} · Full control & management
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: "1.75rem" }}>
        {statCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{
              background: "#fff", borderRadius: 16,
              border: "1.5px solid #f0eeff",
              padding: "1.25rem 1.25rem",
              boxShadow: "0 2px 16px rgba(91,80,232,0.06)",
              display: "flex", alignItems: "center", gap: 14,
            }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: c.color, fontFamily: "'Sora', sans-serif", lineHeight: 1.1 }}>
                {loading ? "—" : c.value}
              </p>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#9ca3af", fontWeight: 600 }}>{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "1.75rem" }}>
        {[
          { label: "Invite Members", icon: <FiUserPlus />, color: "#5b50e8", bg: "#ede9fe", action: () => setActiveTab("org") },
          { label: "Manage Members", icon: <FiUsers />,    color: "#059669", bg: "#d1fae5", action: () => setActiveTab("members") },
          { label: `Review ${pending.length} Pending`, icon: <MdOutlinePendingActions />, color: pending.length > 0 ? "#d97706" : "#9ca3af", bg: pending.length > 0 ? "#fef3c7" : "#f3f4f6", action: () => setActiveTab("pending") },
          { label: "Org Settings",    icon: <MdOutlineSettings />, color: "#7c3aed", bg: "#f5f3ff", action: () => setActiveTab("org") },
        ].map((a, i) => (
          <motion.button
            key={a.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={a.action}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: a.bg, color: a.color,
              border: "none", borderRadius: 12, padding: "0.6rem 1.1rem",
              fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {a.icon} {a.label}
          </motion.button>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", gap: 4, marginBottom: "1.5rem",
        background: "#f5f3ff", borderRadius: 14, padding: 4, width: "fit-content",
      }}>
        {tabs.map((t) => (
          <button
            key={t.id} onClick={() => setActiveTab(t.id as any)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0.5rem 1.1rem", borderRadius: 10, border: "none",
              background: activeTab === t.id ? "#5b50e8" : "transparent",
              color: activeTab === t.id ? "#fff" : "#7b77a8",
              fontWeight: 700, cursor: "pointer", fontSize: "0.83rem",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s",
              boxShadow: activeTab === t.id ? "0 2px 10px rgba(91,80,232,0.25)" : "none",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {/* ─── OVERVIEW ─── */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Recent members */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff", padding: "1.5rem", boxShadow: "0 2px 16px rgba(91,80,232,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1rem", margin: 0, color: "#1a1740" }}>Recent Members</h3>
                  <button onClick={() => setActiveTab("members")} style={{ background: "none", border: "none", color: "#5b50e8", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
                    View all <FiArrowRight size={12} />
                  </button>
                </div>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...Array(4)].map((_, i) => <div key={i} style={{ height: 48, borderRadius: 10, background: "#f5f3ff" }} />)}
                  </div>
                ) : members.slice(0, 5).map((m, i) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 4 ? "1px solid #f9f8ff" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {m.image
                        ? <Image src={m.image} alt={m.full_name} width={36} height={36} style={{ objectFit: "cover" }} />
                        : <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#7c3aed" }}>{m.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#1a1740", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.full_name}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#9ca3af" }}>{(m as any).department ?? "No dept"}</p>
                    </div>
                    {roleBadge(m.role)}
                  </div>
                ))}
              </div>

              {/* Pending approvals */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff", padding: "1.5rem", boxShadow: "0 2px 16px rgba(91,80,232,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1rem", margin: 0, color: "#1a1740" }}>
                    Pending Approvals
                    {pending.length > 0 && <span style={{ marginLeft: 8, background: "#fef3c7", color: "#d97706", borderRadius: 20, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 800 }}>{pending.length}</span>}
                  </h3>
                  <button onClick={() => setActiveTab("pending")} style={{ background: "none", border: "none", color: "#5b50e8", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
                    Review all <FiArrowRight size={12} />
                  </button>
                </div>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...Array(3)].map((_, i) => <div key={i} style={{ height: 48, borderRadius: 10, background: "#f5f3ff" }} />)}
                  </div>
                ) : pending.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 0", color: "#9ca3af" }}>
                    <FaUserCheck size={32} style={{ opacity: 0.3, marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                    <p style={{ margin: 0, fontSize: "0.85rem" }}>All caught up! 🎉</p>
                  </div>
                ) : pending.slice(0, 5).map((u, i) => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < pending.length - 1 ? "1px solid #f9f8ff" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#ea580c" }}>{u.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#1a1740", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.full_name}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#9ca3af" }}>{u.email}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("pending"); setExpanded(u.id); }}
                      style={{ background: "#5b50e8", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>

              {/* Dept breakdown */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff", padding: "1.5rem", boxShadow: "0 2px 16px rgba(91,80,232,0.05)", gridColumn: "1 / -1" }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1rem", margin: "0 0 1.25rem", color: "#1a1740" }}>Department Breakdown</h3>
                {loading ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {[...Array(6)].map((_, i) => <div key={i} style={{ height: 40, width: 140, borderRadius: 10, background: "#f5f3ff" }} />)}
                  </div>
                ) : orgDepts.length === 0 ? (
                  <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>No departments configured.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {orgDepts.map((dept: string) => {
                      const count = members.filter((m: any) => m.department === dept).length;
                      return (
                        <div key={dept} style={{
                          background: "#faf9ff", border: "1.5px solid #e4e2f8",
                          borderRadius: 12, padding: "0.6rem 1rem",
                          display: "flex", alignItems: "center", gap: 10,
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5b50e8", flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a1740" }}>{dept}</span>
                          <span style={{ fontSize: "0.75rem", background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PENDING ─── */}
        {activeTab === "pending" && (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[...Array(3)].map((_, i) => <div key={i} style={{ height: 80, borderRadius: 14, background: "#f5f3ff" }} />)}
              </div>
            ) : pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem", color: "#9ca3af", background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff" }}>
                <FaUserCheck size={44} style={{ opacity: 0.25, marginBottom: 16, display: "block", margin: "0 auto 16px" }} />
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#b0aed0" }}>No pending requests!</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>All membership requests have been handled. 🎉</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {pending.map((u, i) => (
                  <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ background: "#fff", border: "1.5px solid #f0eeff", borderRadius: 18, padding: "1.25rem 1.5rem", boxShadow: "0 2px 16px rgba(91,80,232,0.05)" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {u.image
                          ? <Image src={u.image} alt={u.full_name} width={46} height={46} style={{ objectFit: "cover" }} />
                          : <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#7c3aed" }}>{u.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <p style={{ fontWeight: 700, margin: 0, color: "#1a1740" }}>{u.full_name}</p>
                        <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: "2px 0 6px" }}>{u.email}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#fef3c7", color: "#d97706", borderRadius: 20, padding: "2px 9px" }}>⏳ Pending</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "2px 9px" }}>Requested: {u.role.replace("_", " ")}</span>
                        </div>
                      </div>
                      <button onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                        style={{ padding: "0.5rem 1.1rem", borderRadius: 10, border: "1.5px solid #e4e2f8", background: expanded === u.id ? "#5b50e8" : "#fff", color: expanded === u.id ? "#fff" : "#5b50e8", cursor: "pointer", fontWeight: 700, fontSize: "0.83rem", fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s" }}>
                        {expanded === u.id ? "Close" : "Review ↓"}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expanded === u.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f5f3ff", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {/* Approve */}
                            <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: 14, padding: "1rem 1.25rem", border: "1px solid #bbf7d0" }}>
                              <p style={{ fontWeight: 800, color: "#065f46", marginBottom: 12, fontSize: "0.9rem", fontFamily: "'Sora', sans-serif" }}>✅ Approve Member</p>
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                                <div>
                                  <label style={{ fontSize: "0.75rem", color: "#374151", fontWeight: 700, display: "block", marginBottom: 4 }}>Assign Role</label>
                                  <select value={approveForm[u.id]?.role ?? u.role} onChange={(e) => setApproveForm((f) => ({ ...f, [u.id]: { ...f[u.id], role: e.target.value } }))}
                                    style={{ padding: "0.45rem 0.7rem", borderRadius: 8, border: "1.5px solid #bbf7d0", fontSize: "0.82rem", background: "#fff", color: "#1a1740" }}>
                                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                  </select>
                                </div>
                                {orgDepts.length > 0 && (
                                  <div>
                                    <label style={{ fontSize: "0.75rem", color: "#374151", fontWeight: 700, display: "block", marginBottom: 4 }}>Department</label>
                                    <select value={approveForm[u.id]?.dept ?? ""} onChange={(e) => setApproveForm((f) => ({ ...f, [u.id]: { ...f[u.id], dept: e.target.value } }))}
                                      style={{ padding: "0.45rem 0.7rem", borderRadius: 8, border: "1.5px solid #bbf7d0", fontSize: "0.82rem", background: "#fff", color: "#1a1740" }}>
                                      <option value="">No dept</option>
                                      {orgDepts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                  </div>
                                )}
                              </div>
                              <button onClick={() => handleApprove(u.id)} disabled={processing === u.id}
                                style={{ display: "flex", alignItems: "center", gap: 6, background: "#059669", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.83rem", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 10px rgba(5,150,105,0.25)", opacity: processing === u.id ? 0.6 : 1 }}>
                                <FaUserCheck size={13} /> {processing === u.id ? "Processing…" : "Approve & Notify"}
                              </button>
                            </div>

                            {/* Reject */}
                            <div style={{ background: "linear-gradient(135deg, #fff7f7, #fee2e2)", borderRadius: 14, padding: "1rem 1.25rem", border: "1px solid #fecaca" }}>
                              <p style={{ fontWeight: 800, color: "#991b1b", marginBottom: 12, fontSize: "0.9rem", fontFamily: "'Sora', sans-serif" }}>❌ Decline Request</p>
                              <textarea placeholder="Optional: reason for rejection..." value={rejectReason[u.id] ?? ""} onChange={(e) => setRejectReason((r) => ({ ...r, [u.id]: e.target.value }))} rows={2}
                                style={{ width: "100%", padding: "0.55rem 0.7rem", borderRadius: 8, border: "1.5px solid #fecaca", fontSize: "0.82rem", resize: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }} />
                              <button onClick={() => handleReject(u.id)} disabled={processing === u.id}
                                style={{ display: "flex", alignItems: "center", gap: 6, background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.83rem", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 10px rgba(220,38,38,0.22)", opacity: processing === u.id ? 0.6 : 1 }}>
                                <FaUserTimes size={13} /> {processing === u.id ? "Processing…" : "Decline & Notify"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── MEMBERS ─── */}
        {activeTab === "members" && (
          <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} style={{ height: 72, borderRadius: 14, background: "#f5f3ff" }} />)
              ) : members.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af", background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff" }}>
                  <FiUsers size={40} style={{ opacity: 0.25, marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
                  <p>No members yet.</p>
                </div>
              ) : members.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                  style={{ background: "#fff", border: "1.5px solid #f0eeff", borderRadius: 16, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 2px 10px rgba(91,80,232,0.04)" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ede9fe", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {m.image ? <Image src={m.image} alt={m.full_name} width={40} height={40} style={{ objectFit: "cover" }} /> : <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#7c3aed" }}>{m.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <p style={{ fontWeight: 700, margin: 0, color: "#1a1740", fontSize: "0.9rem" }}>{m.full_name}</p>
                    <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: "2px 0 0" }}>{m.email}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {roleBadge(m.role)}
                    {m.department && <span style={{ fontSize: "0.7rem", background: "#dbeafe", color: "#2563eb", borderRadius: 20, padding: "2px 9px", fontWeight: 700 }}>{m.department}</span>}
                    <span style={{ fontSize: "0.7rem", background: m.status === "approved" ? "#d1fae5" : "#fef3c7", color: m.status === "approved" ? "#059669" : "#d97706", borderRadius: 20, padding: "2px 9px", fontWeight: 700 }}>{m.status}</span>
                  </div>
                  {m.status === "approved" && m.id !== user?.id && (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select defaultValue={m.role} onChange={(e) => setApproveForm((f) => ({ ...f, [m.id]: { role: e.target.value, dept: f[m.id]?.dept ?? m.department ?? "" } }))}
                        style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: "1.5px solid #e4e2f8", fontSize: "0.78rem", background: "#faf9ff", color: "#1a1740" }}>
                        {["member","employee","hr","org_admin","admin"].map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {orgDepts.length > 0 && (
                        <select defaultValue={m.department ?? ""} onChange={(e) => setApproveForm((f) => ({ ...f, [m.id]: { dept: e.target.value, role: f[m.id]?.role ?? m.role } }))}
                          style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: "1.5px solid #e4e2f8", fontSize: "0.78rem", background: "#faf9ff", color: "#1a1740" }}>
                          <option value="">No dept</option>
                          {orgDepts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      )}
                      <button onClick={() => handleUpdateMember(m.id)} disabled={processing === m.id}
                        style={{ padding: "0.35rem 0.85rem", background: "#5b50e8", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", opacity: processing === m.id ? 0.6 : 1 }}>
                        {processing === m.id ? "…" : "Save"}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── ORGANISATION ─── */}
        {activeTab === "org" && (
          <motion.div key="org" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div style={{ height: 200, borderRadius: 18, background: "#f5f3ff" }} />
            ) : !orgData ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af", background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff" }}>
                <HiOutlineBuildingOffice2 size={40} style={{ opacity: 0.25, marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
                <p>No organisation found.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Org banner */}
                <div style={{ background: "linear-gradient(135deg, #1a1740 0%, #2e2a6e 50%, #3d37a8 100%)", borderRadius: 20, padding: "1.75rem 2rem", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(26,23,64,0.25)" }}>
                  <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <HiOutlineBuildingOffice2 style={{ fontSize: 26, color: "#c4b5fd" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#a5b4fc", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Organisation</p>
                      <p style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>{orgData.name}</p>
                      <p style={{ margin: "2px 0 0", color: "#c4b5fd", fontSize: "0.82rem", textTransform: "capitalize" }}>{orgData.org_type}</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 6px", fontSize: "0.72rem", color: "#a5b4fc", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Invite Code</p>
                      <button onClick={copyInvite} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "7px 14px", cursor: "pointer", color: "#fff", fontFamily: "monospace", fontSize: "1.05rem", fontWeight: 800, transition: "all 0.2s" }}>
                        {orgData.invite_code}
                        {copied ? <FiCheck style={{ color: "#86efac" }} /> : <FiCopy style={{ opacity: 0.7 }} />}
                      </button>
                      <p style={{ margin: "6px 0 0", fontSize: "0.72rem", color: "#a5b4fc" }}>Share this to invite members</p>
                    </div>
                  </div>
                </div>

                {/* Departments */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff", padding: "1.5rem", boxShadow: "0 2px 16px rgba(91,80,232,0.05)" }}>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1rem", margin: "0 0 1.25rem", color: "#1a1740" }}>Departments ({orgDepts.length})</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {orgDepts.map((dept: string) => {
                      const count = members.filter((m: any) => m.department === dept).length;
                      return (
                        <div key={dept} style={{ background: "#faf9ff", border: "1.5px solid #e4e2f8", borderRadius: 12, padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontWeight: 700, fontSize: "0.87rem", color: "#1a1740" }}>{dept}</span>
                          <span style={{ fontSize: "0.72rem", background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>{count} member{count !== 1 ? "s" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
