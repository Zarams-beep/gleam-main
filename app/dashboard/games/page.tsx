// app/dashboard/games/page.tsx
"use client";
import { motion } from "framer-motion";
import { MdSportsEsports } from "react-icons/md";

export default function GamesPage() {
  return (
    <div style={{
      padding: "1.75rem", maxWidth: 600, margin: "0 auto",
      textAlign: "center", fontFamily: "'DM Sans', sans-serif",
    }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "2rem" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px",
          background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", color: "#7c3aed",
          boxShadow: "0 4px 16px rgba(124,58,237,0.20)",
        }}>
          <MdSportsEsports />
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 6px", color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
          Games
        </h1>
        <p style={{ color: "#7b77a8", margin: 0, fontSize: "0.9rem" }}>
          A little friendly competition is on the way
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
          border: "1.5px solid #ddd6fe",
          borderRadius: 24, padding: "3rem 2rem",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 14 }}>🎮</div>
        <p style={{ fontWeight: 700, color: "#4c1d95", margin: "0 0 8px", fontSize: "1.05rem", fontFamily: "'Sora', sans-serif" }}>
          Coming soon
        </p>
        <p style={{ color: "#6d28d9", margin: 0, fontSize: "0.88rem", lineHeight: 1.6 }}>
          We're building lightweight, coin-earning games to play with your teammates.
          Check back soon!
        </p>
      </motion.div>
    </div>
  );
}
