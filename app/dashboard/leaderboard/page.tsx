// app/dashboard/leaderboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { leaderboardApi } from "@/utils/api";
import { LeaderboardEntry, DeptLeaderboardEntry } from "@/types/auth";
import { useAppSelector } from "@/store/hooks";
import { motion } from "framer-motion";
import Image from "next/image";
import { MdLeaderboard } from "react-icons/md";
import { GiLaurelsTrophy } from "react-icons/gi";
import { PiMedalFill, PiCoinsLight, PiFireSimple } from "react-icons/pi";
import { LuHeart } from "react-icons/lu";

export default function LeaderboardPage() {
  const user = useAppSelector((s) => s.user.user);
  const [tab, setTab]             = useState<"individual" | "department">("individual");
  const [entries, setEntries]     = useState<LeaderboardEntry[]>([]);
  const [deptEntries, setDeptEntries] = useState<DeptLeaderboardEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deptFilter, setDeptFilter] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    if (tab === "individual") {
      leaderboardApi.individual(deptFilter || undefined)
        .then((r) => setEntries(r.leaderboard ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      leaderboardApi.departments()
        .then((r) => setDeptEntries(r.leaderboard ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [tab, deptFilter]);

  const medal = (rank: number) => {
    if (rank === 1) return <GiLaurelsTrophy style={{ color: "#f59e0b", fontSize: 20 }} />;
    if (rank === 2) return <PiMedalFill style={{ color: "#9ca3af", fontSize: 20 }} />;
    if (rank === 3) return <PiMedalFill style={{ color: "#b45309", fontSize: 20 }} />;
    return <span style={{ fontWeight: 700, color: "#6b7280" }}>#{rank}</span>;
  };

  return (
    <div style={{ padding: "1.75rem", maxWidth: 760, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
          }}>
            <MdLeaderboard style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
              Leaderboard
            </h1>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.82rem" }}>See who's spreading the most positivity</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {(["individual", "department"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.5rem 1.2rem", borderRadius: 20, border: "none",
              background: tab === t ? "#7c3aed" : "#f3f4f6",
              color: tab === t ? "#fff" : "#6b7280",
              fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Dept filter (individual tab) */}
      {tab === "individual" && user?.orgId && (
        <input
          type="text"
          placeholder="Filter by department…"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{
            marginBottom: "1.25rem", padding: "0.6rem 1rem", borderRadius: 8,
            border: "1.5px solid #e5e7eb", fontSize: "0.9rem", outline: "none",
          }}
        />
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 64, borderRadius: 12, background: "#f3f4f6" }} />
          ))}
        </div>
      ) : tab === "individual" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map((e, i) => (
            <motion.div
              key={e.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: e.isCurrentUser ? "#faf5ff" : "#fff",
                border: `1.5px solid ${e.isCurrentUser ? "#ddd6fe" : "#f3f4f6"}`,
                borderRadius: 14, padding: "0.9rem 1.2rem",
              }}
            >
              <span style={{ fontSize: "1.3rem", width: 36, textAlign: "center" }}>{medal(e.rank)}</span>
              <Image
                src={e.image || "/jason-leung-uhxiOmoVhOo-unsplash.jpg"}
                alt={e.fullName} width={42} height={42}
                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, margin: 0 }}>
                  {e.fullName}
                  {e.isCurrentUser && <span style={{ fontSize: "0.75rem", color: "#7c3aed", marginLeft: 8 }}>You</span>}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0 }}>{e.department ?? "N/A"}</p>
              </div>
              <div style={{ display: "flex", gap: 20, fontSize: "0.85rem", color: "#6b7280" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><PiCoinsLight style={{ color: "#d97706" }} /> {e.coins}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><PiFireSimple style={{ color: "#f97316" }} /> {e.streak}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><LuHeart style={{ color: "#ec4899" }} /> {e.complimentsSent}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {deptEntries.map((d, i) => (
            <motion.div
              key={d.department}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#fff", border: "1.5px solid #f3f4f6",
                borderRadius: 14, padding: "0.9rem 1.2rem",
              }}
            >
              <span style={{ fontSize: "1.3rem", width: 36, textAlign: "center" }}>{medal(d.rank)}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, margin: 0 }}>{d.department}</p>
                <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0 }}>{d.activeMembers} active members</p>
              </div>
              <span style={{ fontWeight: 600, color: "#7c3aed" }}>💌 {d.totalCompliments}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
