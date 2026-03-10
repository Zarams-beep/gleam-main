// app/dashboard/admin/pending/page.tsx
"use client";
import { useState, useEffect } from "react";
import { adminApi, orgApi } from "@/utils/api";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaUserCheck, FaUserTimes, FaUserCog } from "react-icons/fa";
import { MdPending } from "react-icons/md";

const ROLES = ["member", "employee", "hr", "org_admin", "admin"];

type PendingUser = {
  id: string;
  full_name: string;
  email: string;
  image: string | null;
  role: string;
  status: string;
  created_at: string;
};

type Member = PendingUser & { department: string | null };

export default function AdminPendingPage() {
  const user   = useAppSelector((s) => s.user.user);
  const router = useRouter();

  const [tab, setTab]           = useState<"pending" | "members">("pending");
  const [pending, setPending]   = useState<PendingUser[]>([]);
  const [members, setMembers]   = useState<Member[]>([]);
  const [orgDepts, setOrgDepts] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);

  // Per-user approve form state
  const [approveForm, setApproveForm] = useState<Record<string, { role: string; dept: string }>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isAdmin = ["super_admin", "admin", "org_admin"].includes(user?.role ?? "");

  useEffect(() => {
    if (!isAdmin) { router.replace("/dashboard"); return; }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, membersRes, orgRes] = await Promise.all([
        adminApi.pending(),
        adminApi.members(),
        orgApi.me().catch(() => null),
      ]);
      setPending(pendingRes.pending ?? []);
      setMembers(membersRes.members ?? []);
      const depts = (orgRes?.org?.departments ?? []).map((d: any) => d.name).filter(Boolean);
      setOrgDepts(depts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (userId: string) => {
    const form = approveForm[userId] ?? { role: "member", dept: "" };
    setProcessing(userId);
    try {
      await adminApi.approve(userId, { role: form.role, department: form.dept || undefined });
      setPending((p) => p.filter((u) => u.id !== userId));
      showToast("✅ User approved and notified by email!");
      loadData();
    } catch (e: any) {
      showToast("❌ " + (e.message || "Failed to approve"));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessing(userId);
    try {
      await adminApi.reject(userId, { reason: rejectReason[userId] || "" });
      setPending((p) => p.filter((u) => u.id !== userId));
      showToast("User rejected and notified by email.");
      loadData();
    } catch (e: any) {
      showToast("❌ " + (e.message || "Failed to reject"));
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateMember = async (userId: string) => {
    const form = approveForm[userId];
    if (!form) return;
    setProcessing(userId);
    try {
      await adminApi.updateMember(userId, {
        role: form.role || undefined,
        department: form.dept || undefined,
      });
      showToast("✅ Member updated.");
      loadData();
      setExpanded(null);
    } catch (e: any) {
      showToast("❌ " + (e.message || "Failed"));
    } finally {
      setProcessing(null);
    }
  };

  const roleColor = (role: string) => ({
    super_admin: "#ef4444", admin: "#f97316", org_admin: "#8b5cf6",
    hr: "#3b82f6", employee: "#10b981", member: "#6b7280",
  }[role] ?? "#6b7280");

  const statusBadge = (status: string) => {
    const cfg: Record<string, { bg: string; color: string; label: string }> = {
      pending:  { bg: "#fef3c7", color: "#d97706", label: "Pending" },
      approved: { bg: "#d1fae5", color: "#059669", label: "Approved" },
      rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
    };
    const c = cfg[status] ?? cfg.pending;
    return (
      <span style={{
        fontSize: "0.72rem", fontWeight: 700, background: c.bg, color: c.color,
        borderRadius: 20, padding: "2px 10px",
      }}>{c.label}</span>
    );
  };

  if (!isAdmin) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: 860, margin: "0 auto" }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 20, right: 20, zIndex: 9999,
              background: "#1e293b", color: "#fff", borderRadius: 12,
              padding: "0.9rem 1.5rem", fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 4 }}>
          <FaUserCog style={{ display: "inline", marginRight: 10, color: "#7c3aed" }} />
          Admin Panel
        </h1>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          Manage member requests and your organisation team
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button
          onClick={() => setTab("pending")}
          style={{
            padding: "0.5rem 1.2rem", borderRadius: 20, border: "none",
            background: tab === "pending" ? "#7c3aed" : "#f3f4f6",
            color: tab === "pending" ? "#fff" : "#6b7280",
            fontWeight: 600, cursor: "pointer",
          }}
        >
          <MdPending style={{ display: "inline", marginRight: 6 }} />
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab("members")}
          style={{
            padding: "0.5rem 1.2rem", borderRadius: 20, border: "none",
            background: tab === "members" ? "#7c3aed" : "#f3f4f6",
            color: tab === "members" ? "#fff" : "#6b7280",
            fontWeight: 600, cursor: "pointer",
          }}
        >
          All Members ({members.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: 14, background: "#f3f4f6" }} />
          ))}
        </div>
      ) : tab === "pending" ? (
        /* ── Pending users ── */
        pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
            <FaUserCheck size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No pending requests — you're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pending.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: "#fff", border: "1.5px solid #e5e7eb",
                  borderRadius: 16, padding: "1.25rem 1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <Image
                    src={u.image || "/jason-leung-uhxiOmoVhOo-unsplash.jpg"}
                    alt={u.full_name} width={46} height={46}
                    style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>{u.full_name}</p>
                    <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: "2px 0" }}>{u.email}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      {statusBadge(u.status)}
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "2px 10px" }}>
                        Requested: {u.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                    style={{
                      padding: "0.5rem 1rem", borderRadius: 8, border: "1.5px solid #e5e7eb",
                      background: "#f9fafb", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
                    }}
                  >
                    {expanded === u.id ? "Close" : "Review"}
                  </button>
                </div>

                {/* Expand: approve/reject form */}
                <AnimatePresence>
                  {expanded === u.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: 12 }}>

                        {/* Approve section */}
                        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "1rem" }}>
                          <p style={{ fontWeight: 700, color: "#065f46", marginBottom: 10, fontSize: "0.9rem" }}>✅ Approve</p>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600 }}>Assign Role</label>
                              <select
                                value={approveForm[u.id]?.role ?? u.role}
                                onChange={(e) => setApproveForm((f) => ({ ...f, [u.id]: { ...f[u.id], role: e.target.value } }))}
                                style={{ display: "block", marginTop: 4, padding: "0.5rem 0.8rem", borderRadius: 8, border: "1.5px solid #d1fae5", fontSize: "0.875rem" }}
                              >
                                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                            {orgDepts.length > 0 && (
                              <div>
                                <label style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600 }}>Assign Department</label>
                                <select
                                  value={approveForm[u.id]?.dept ?? ""}
                                  onChange={(e) => setApproveForm((f) => ({ ...f, [u.id]: { ...f[u.id], dept: e.target.value } }))}
                                  style={{ display: "block", marginTop: 4, padding: "0.5rem 0.8rem", borderRadius: 8, border: "1.5px solid #d1fae5", fontSize: "0.875rem" }}
                                >
                                  <option value="">No department</option>
                                  {orgDepts.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={processing === u.id}
                            style={{
                              marginTop: 12, display: "flex", alignItems: "center", gap: 8,
                              background: "#059669", color: "#fff", border: "none",
                              borderRadius: 8, padding: "0.6rem 1.2rem",
                              fontWeight: 700, cursor: "pointer", fontSize: "0.875rem",
                            }}
                          >
                            <FaUserCheck />
                            {processing === u.id ? "Processing…" : "Approve & Send Email"}
                          </button>
                        </div>

                        {/* Reject section */}
                        <div style={{ background: "#fff7f7", borderRadius: 12, padding: "1rem" }}>
                          <p style={{ fontWeight: 700, color: "#991b1b", marginBottom: 10, fontSize: "0.9rem" }}>❌ Reject</p>
                          <textarea
                            placeholder="Optional: reason for rejection (will appear in email)"
                            value={rejectReason[u.id] ?? ""}
                            onChange={(e) => setRejectReason((r) => ({ ...r, [u.id]: e.target.value }))}
                            rows={2}
                            style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "1.5px solid #fecaca", fontSize: "0.875rem", resize: "none", boxSizing: "border-box" }}
                          />
                          <button
                            onClick={() => handleReject(u.id)}
                            disabled={processing === u.id}
                            style={{
                              marginTop: 8, display: "flex", alignItems: "center", gap: 8,
                              background: "#dc2626", color: "#fff", border: "none",
                              borderRadius: 8, padding: "0.6rem 1.2rem",
                              fontWeight: 700, cursor: "pointer", fontSize: "0.875rem",
                            }}
                          >
                            <FaUserTimes />
                            {processing === u.id ? "Processing…" : "Reject & Send Email"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* ── All members ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                background: "#fff", border: "1.5px solid #f3f4f6",
                borderRadius: 14, padding: "1rem 1.25rem",
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}
            >
              <Image
                src={m.image || "/jason-leung-uhxiOmoVhOo-unsplash.jpg"}
                alt={m.full_name} width={40} height={40}
                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontWeight: 700, margin: 0 }}>{m.full_name}</p>
                <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: "2px 0" }}>{m.email}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  {statusBadge(m.status)}
                  <span style={{ fontSize: "0.72rem", background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>{m.role}</span>
                  {m.department && <span style={{ fontSize: "0.72rem", background: "#dbeafe", color: "#2563eb", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>{m.department}</span>}
                </div>
              </div>

              {/* Quick edit for approved members */}
              {m.status === "approved" && m.id !== user?.id && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    defaultValue={m.role}
                    onChange={(e) => setApproveForm((f) => ({ ...f, [m.id]: { ...f[m.id], role: e.target.value, dept: f[m.id]?.dept ?? m.department ?? "" } }))}
                    style={{ padding: "0.4rem 0.6rem", borderRadius: 6, border: "1.5px solid #e5e7eb", fontSize: "0.8rem" }}
                  >
                    {["member","employee","hr","org_admin","admin"].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select
                    defaultValue={m.department ?? ""}
                    onChange={(e) => setApproveForm((f) => ({ ...f, [m.id]: { ...f[m.id], dept: e.target.value, role: f[m.id]?.role ?? m.role } }))}
                    style={{ padding: "0.4rem 0.6rem", borderRadius: 6, border: "1.5px solid #e5e7eb", fontSize: "0.8rem" }}
                  >
                    <option value="">No dept</option>
                    {orgDepts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button
                    onClick={() => handleUpdateMember(m.id)}
                    disabled={processing === m.id}
                    style={{
                      padding: "0.4rem 0.8rem", background: "#7c3aed", color: "#fff",
                      border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                    }}
                  >
                    {processing === m.id ? "…" : "Save"}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
