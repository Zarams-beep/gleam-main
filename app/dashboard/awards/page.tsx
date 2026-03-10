// app/dashboard/awards/page.tsx
"use client";
import { useAppSelector } from "@/store/hooks";
import { motion } from "framer-motion";
import { FaAward, FaTrophy, FaStar, FaFire, FaHeart } from "react-icons/fa";
import { GiBeveledStar } from "react-icons/gi";

type Award = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  requirement: number;
  current: number;
  unit: string;
};

export default function AwardsPage() {
  const stats = useAppSelector((s) => s.stats.stats);
  const user  = useAppSelector((s) => s.user.user);

  const awards: Award[] = [
    {
      id: "first_compliment",
      title: "First Spark",
      description: "Send your very first compliment",
      icon: <FaHeart />,
      color: "#ec4899",
      unlocked: (stats?.totalSent ?? 0) >= 1,
      requirement: 1,
      current: stats?.totalSent ?? 0,
      unit: "sent",
    },
    {
      id: "10_sent",
      title: "Beam of Light",
      description: "Send 10 compliments",
      icon: <FaStar />,
      color: "#f59e0b",
      unlocked: (stats?.totalSent ?? 0) >= 10,
      requirement: 10,
      current: stats?.totalSent ?? 0,
      unit: "sent",
    },
    {
      id: "50_sent",
      title: "Positivity Pro",
      description: "Send 50 compliments",
      icon: <FaTrophy />,
      color: "#7c3aed",
      unlocked: (stats?.totalSent ?? 0) >= 50,
      requirement: 50,
      current: stats?.totalSent ?? 0,
      unit: "sent",
    },
    {
      id: "streak_7",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: <FaFire />,
      color: "#f97316",
      unlocked: (stats?.streak ?? 0) >= 7,
      requirement: 7,
      current: stats?.streak ?? 0,
      unit: "days",
    },
    {
      id: "streak_30",
      title: "Monthly Legend",
      description: "Maintain a 30-day streak",
      icon: <FaFire />,
      color: "#ef4444",
      unlocked: (stats?.streak ?? 0) >= 30,
      requirement: 30,
      current: stats?.streak ?? 0,
      unit: "days",
    },
    {
      id: "coins_100",
      title: "Coin Collector",
      description: "Earn 100 coins",
      icon: <GiBeveledStar />,
      color: "#eab308",
      unlocked: (stats?.coins ?? 0) >= 100,
      requirement: 100,
      current: stats?.coins ?? 0,
      unit: "coins",
    },
    {
      id: "coins_500",
      title: "Gleam Wealthy",
      description: "Earn 500 coins",
      icon: <FaAward />,
      color: "#10b981",
      unlocked: (stats?.coins ?? 0) >= 500,
      requirement: 500,
      current: stats?.coins ?? 0,
      unit: "coins",
    },
    {
      id: "perf_80",
      title: "Top Performer",
      description: "Reach 80% performance score",
      icon: <FaTrophy />,
      color: "#3b82f6",
      unlocked: (stats?.performance ?? 0) >= 80,
      requirement: 80,
      current: stats?.performance ?? 0,
      unit: "%",
    },
  ];

  const unlocked = awards.filter((a) => a.unlocked);
  const locked   = awards.filter((a) => !a.unlocked);

  return (
    <div style={{ padding: "2rem", maxWidth: 860, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 4 }}>
          <FaAward style={{ display: "inline", marginRight: 10, color: "#f59e0b" }} />
          Awards
        </h1>
        <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
          {unlocked.length} of {awards.length} unlocked
        </p>

        {/* Progress bar */}
        <div style={{ background: "#f3f4f6", borderRadius: 20, height: 8, marginBottom: "2rem", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked.length / awards.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #a855f7)", borderRadius: 20 }}
          />
        </div>
      </motion.div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#374151", marginBottom: 12 }}>🏆 Unlocked</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: "2rem" }}>
            {unlocked.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: `linear-gradient(135deg, ${a.color}15, ${a.color}30)`,
                  border: `2px solid ${a.color}40`,
                  borderRadius: 16, padding: "1.5rem 1rem", textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", color: a.color, marginBottom: 8 }}>{a.icon}</div>
                <p style={{ fontWeight: 700, margin: "0 0 4px" }}>{a.title}</p>
                <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>{a.description}</p>
                <div style={{
                  marginTop: 12, background: a.color, color: "#fff",
                  borderRadius: 20, padding: "2px 12px", fontSize: "0.75rem",
                  fontWeight: 600, display: "inline-block",
                }}>
                  ✓ Unlocked
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#374151", marginBottom: 12 }}>🔒 Locked</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {locked.map((a, i) => {
              const pct = Math.min(100, Math.round((a.current / a.requirement) * 100));
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: "#f9fafb", border: "1.5px solid #e5e7eb",
                    borderRadius: 16, padding: "1.5rem 1rem", textAlign: "center", opacity: 0.8,
                  }}
                >
                  <div style={{ fontSize: "2rem", color: "#d1d5db", marginBottom: 8 }}>{a.icon}</div>
                  <p style={{ fontWeight: 700, margin: "0 0 4px", color: "#9ca3af" }}>{a.title}</p>
                  <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: "0 0 12px" }}>{a.description}</p>
                  <div style={{ background: "#e5e7eb", borderRadius: 20, height: 6, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.04 }}
                      style={{ height: "100%", background: a.color, borderRadius: 20 }}
                    />
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }}>
                    {a.current} / {a.requirement} {a.unit}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
