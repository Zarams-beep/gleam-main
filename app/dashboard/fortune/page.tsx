// app/dashboard/fortune/page.tsx
"use client";
import { useState, useEffect } from "react";
import { fortuneApi } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function FortunePage() {
  const [fortune, setFortune]   = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [fetching, setFetching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fortuneApi.today()
      .then((r) => {
        setFortune(r.fortune ?? null);
        setUnlocked(r.unlocked ?? false);
        setMessage(r.message ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getNew = async () => {
    setFetching(true);
    try {
      const r = await fortuneApi.random();
      setFortune(r.fortune ?? null);
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };

  return (
    <div style={{
      padding: "1.75rem", maxWidth: 600, margin: "0 auto",
      textAlign: "center", fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "2.5rem" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px",
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", boxShadow: "0 4px 16px rgba(245,158,11,0.20)",
        }}>
          🥠
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 6px", color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
          Fortune Cookie
        </h1>
        <p style={{ color: "#7b77a8", margin: 0, fontSize: "0.9rem" }}>
          Send a compliment each day to unlock your fortune
        </p>
      </motion.div>

      {loading ? (
        /* Skeleton */
        <div style={{ background: "#f3f4f6", borderRadius: 24, height: 200, animation: "pulse 1.5s infinite" }} />
      ) : !unlocked ? (
        /* Locked state */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "linear-gradient(135deg, #fffbeb, #fef9ec)",
            border: "1.5px solid #fde68a",
            borderRadius: 24, padding: "2.5rem 2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 14 }}>🔒</div>
          <p style={{ fontWeight: 700, color: "#92400e", margin: "0 0 8px", fontSize: "1.05rem", fontFamily: "'Sora', sans-serif" }}>
            Today's fortune is locked
          </p>
          <p style={{ color: "#b45309", margin: "0 0 20px", fontSize: "0.88rem", lineHeight: 1.6 }}>
            {message || "Send a compliment today to reveal your fortune cookie!"}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard/send")}
            style={{
              background: "linear-gradient(135deg, #5b50e8, #7c6ef5)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "0.8rem 2rem", fontSize: "0.95rem",
              fontWeight: 700, cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              boxShadow: "0 4px 16px rgba(91,80,232,0.25)",
            }}
          >
            ✨ Send a Compliment
          </motion.button>
        </motion.div>
      ) : (
        /* Unlocked — show fortune */
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={fortune}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{
                background: "linear-gradient(135deg, #fef9ec 0%, #fef3c7 50%, #fde68a 100%)",
                borderRadius: 24, padding: "3rem 2rem",
                marginBottom: "1.75rem",
                boxShadow: "0 8px 40px rgba(245,158,11,0.18)",
                border: "1.5px solid #fde68a",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Decorative dots */}
              <div style={{ position: "absolute", top: 16, left: 16, width: 8, height: 8, borderRadius: "50%", background: "rgba(245,158,11,0.3)" }} />
              <div style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: "rgba(245,158,11,0.3)" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16, width: 8, height: 8, borderRadius: "50%", background: "rgba(245,158,11,0.3)" }} />
              <div style={{ position: "absolute", bottom: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: "rgba(245,158,11,0.3)" }} />

              <p style={{
                fontSize: "1.2rem", fontWeight: 700, color: "#78350f",
                lineHeight: 1.7, margin: 0,
                fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em",
              }}>
                "{fortune}"
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(245,158,11,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={getNew}
            disabled={fetching}
            style={{
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              color: "#fff", border: "none", borderRadius: 14,
              padding: "0.85rem 2.25rem", fontSize: "0.95rem",
              fontWeight: 700, cursor: fetching ? "not-allowed" : "pointer",
              fontFamily: "'Sora', sans-serif",
              boxShadow: "0 4px 20px rgba(245,158,11,0.25)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            {fetching ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>🥠</motion.span>
                Cracking…
              </>
            ) : (
              <>🥠 Crack a New One</>
            )}
          </motion.button>
        </>
      )}
    </div>
  );
}
