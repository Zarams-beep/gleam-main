// app/dashboard/team/page.tsx
"use client";
import { useState, useEffect } from "react";
import { orgApi } from "@/utils/api";
import { useAppSelector } from "@/store/hooks";
import { OrgMember } from "@/types/auth";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { RiTeamFill } from "react-icons/ri";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { MdOutlineLocationOn } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { FiCopy, FiCheck } from "react-icons/fi";

export default function TeamPage() {
  const user = useAppSelector((s) => s.user.user);
  const [org, setOrg]               = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [activeDept, setActiveDept] = useState<string>("all");
  const [search, setSearch]         = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    if (!user?.orgId) { setLoading(false); return; }
    orgApi.me()
      .then((r) => setOrg(r.org))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.orgId]);

  const members: OrgMember[] = org?.members ?? [];
  const departments: string[] = [
    "all",
    ...Array.from(new Set(members.map((m) => m.department).filter(Boolean))) as string[],
  ];

  const filtered = members
    .filter((m) => activeDept === "all" || m.department === activeDept)
    .filter((m) => !search || m.full_name.toLowerCase().includes(search.toLowerCase()));

  const copyCode = () => {
    if (!org?.invite_code) return;
    navigator.clipboard.writeText(org.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const avatarColors = [
    ["#ede9fe","#7c3aed"], ["#dbeafe","#2563eb"], ["#d1fae5","#059669"],
    ["#fef3c7","#d97706"], ["#fce7f3","#db2777"], ["#e0f2fe","#0284c7"],
  ];
  const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div style={{ padding: "1.75rem", maxWidth: 960, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "1.75rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #5b50e8, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RiTeamFill style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
            Team
          </h1>
        </div>
        <p style={{ color: "#7b77a8", margin: 0, fontSize: "0.9rem" }}>
          {org ? `${members.length} member${members.length !== 1 ? "s" : ""} in your organisation` : "Your organisation members"}
        </p>
      </motion.div>

      {/* ── No org state ── */}
      {!user?.orgId ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "linear-gradient(135deg, #fffbeb 0%, #fef9ec 100%)",
            border: "1.5px solid #fde68a",
            borderRadius: 16, padding: "2rem",
            display: "flex", alignItems: "flex-start", gap: 16,
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: "#fef3c7",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            fontSize: "1.3rem",
          }}>
            ⚠️
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "#92400e", margin: "0 0 4px", fontSize: "1rem", fontFamily: "'Sora', sans-serif" }}>
              No organisation yet
            </p>
            <p style={{ color: "#b45309", margin: 0, fontSize: "0.88rem", lineHeight: 1.6 }}>
              You need to join or create an organisation to see your team members and start sending compliments.
            </p>
          </div>
        </motion.div>
      ) : loading ? (
        /* ── Skeleton ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Org banner skeleton */}
          <div style={{ height: 110, borderRadius: 16, background: "linear-gradient(90deg, #e8e6f8 25%, #f0eeff 50%, #e8e6f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ height: 140, borderRadius: 16, background: "#f3f4f6" }} />
            ))}
          </div>
        </div>
      ) : error ? (
        <p style={{ color: "#ef4444", padding: "1rem" }}>{error}</p>
      ) : (
        <>
          {/* ── Org banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "linear-gradient(135deg, #1a1740 0%, #2e2a6e 50%, #3d37a8 100%)",
              borderRadius: 20, padding: "1.5rem 2rem",
              marginBottom: "1.5rem", color: "#fff",
              display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center",
              boxShadow: "0 8px 32px rgba(26, 23, 64, 0.25)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <HiOutlineBuildingOffice2 style={{ fontSize: 24, color: "#c4b5fd" }} />
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#a5b4fc", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Organisation</p>
                <p style={{ fontWeight: 800, margin: 0, fontSize: "1.15rem", fontFamily: "'Sora', sans-serif" }}>{org?.name}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#a5b4fc", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Type</p>
                <p style={{ fontWeight: 700, margin: 0, textTransform: "capitalize" }}>{org?.org_type}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#a5b4fc", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Members</p>
                <p style={{ fontWeight: 700, margin: 0 }}>{members.length}</p>
              </div>
              {user?.department && (
                <div>
                  <p style={{ fontSize: "0.72rem", color: "#a5b4fc", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Your Dept</p>
                  <p style={{ fontWeight: 700, margin: 0 }}>{user.department}</p>
                </div>
              )}
              {/* Invite code */}
              <div>
                <p style={{ fontSize: "0.72rem", color: "#a5b4fc", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Invite Code</p>
                <button
                  onClick={copyCode}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8, padding: "5px 12px", cursor: "pointer", color: "#fff",
                    fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                >
                  {org?.invite_code}
                  {copied
                    ? <FiCheck style={{ fontSize: 14, color: "#86efac" }} />
                    : <FiCopy style={{ fontSize: 14, opacity: 0.7 }} />
                  }
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Search + Dept filters ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "1.5rem", alignItems: "center" }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1.5px solid #e4e2f8",
              borderRadius: 12, padding: "0.55rem 1rem", flex: "1 1 200px",
              boxShadow: "0 2px 8px rgba(91,80,232,0.06)",
            }}>
              <IoSearch style={{ color: "#9ca3af", fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: "0.88rem", color: "#1a1740", width: "100%",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Dept pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {departments.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDept(d)}
                  style={{
                    padding: "0.4rem 1rem", borderRadius: 20,
                    border: `1.5px solid ${activeDept === d ? "#5b50e8" : "#e4e2f8"}`,
                    background: activeDept === d ? "#5b50e8" : "#fff",
                    color: activeDept === d ? "#fff" : "#7b77a8",
                    fontWeight: 600, cursor: "pointer", fontSize: "0.82rem",
                    transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {d === "all" ? `All (${members.length})` : d}
                </button>
              ))}
            </div>
          </div>

          {/* ── Members grid ── */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#b0aed0" }}>
              <RiTeamFill style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }} />
              <p>No members found</p>
            </div>
          ) : (
            <motion.div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
            >
              <AnimatePresence>
                {filtered.map((m, i) => {
                  const isMe = m.id === user?.id;
                  const [bg, fg] = getColor(m.full_name);
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.035, type: "spring", stiffness: 260, damping: 22 }}
                      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(91,80,232,0.13)" }}
                      style={{
                        background: isMe ? "linear-gradient(135deg, #faf8ff, #f0edff)" : "#fff",
                        border: `1.5px solid ${isMe ? "#c4b5fd" : "#f0eeff"}`,
                        borderRadius: 18, padding: "1.5rem 1rem",
                        textAlign: "center", cursor: "default",
                        boxShadow: "0 2px 12px rgba(91,80,232,0.06)",
                        transition: "box-shadow 0.2s",
                        position: "relative",
                      }}
                    >
                      {isMe && (
                        <div style={{
                          position: "absolute", top: 10, right: 10,
                          fontSize: "0.65rem", fontWeight: 700, background: "#5b50e8",
                          color: "#fff", borderRadius: 20, padding: "2px 8px",
                        }}>
                          You
                        </div>
                      )}

                      {/* Avatar */}
                      <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                        {m.image ? (
                          <Image
                            src={m.image}
                            alt={m.full_name}
                            width={60} height={60}
                            style={{ borderRadius: "50%", objectFit: "cover", border: `3px solid ${isMe ? "#c4b5fd" : "#f0eeff"}` }}
                          />
                        ) : (
                          <div style={{
                            width: 60, height: 60, borderRadius: "50%",
                            background: bg, color: fg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.1rem", fontWeight: 800, border: `3px solid ${isMe ? "#c4b5fd" : "#f0eeff"}`,
                            fontFamily: "'Sora', sans-serif",
                          }}>
                            {getInitials(m.full_name)}
                          </div>
                        )}
                      </div>

                      <p style={{ fontWeight: 700, margin: "0 0 3px", fontSize: "0.92rem", color: "#1a1740", fontFamily: "'Sora', sans-serif" }}>
                        {m.full_name}
                      </p>

                      {m.department && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 10 }}>
                          <MdOutlineLocationOn style={{ fontSize: 12, color: "#9ca3af" }} />
                          <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0 }}>{m.department}</p>
                        </div>
                      )}

                      {/* Stats pills */}
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <span style={{ fontSize: "0.72rem", background: "#fef9c3", color: "#a16207", borderRadius: 20, padding: "3px 8px", fontWeight: 600 }}>
                          🪙 {m.coins}
                        </span>
                        <span style={{ fontSize: "0.72rem", background: "#fff7ed", color: "#c2410c", borderRadius: 20, padding: "3px 8px", fontWeight: 600 }}>
                          🔥 {m.streak}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
