// app/dashboard/fortune/page.tsx
"use client";
import { useState, useEffect } from "react";
import { fortuneApi } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaShareAlt, FaCheck } from "react-icons/fa";

export default function FortunePage() {
  const [fortune, setFortune]   = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [fetching, setFetching] = useState(false);
  const [cracksRemaining, setCracksRemaining] = useState(0);
  const [cracksTotal, setCracksTotal]         = useState(0);
  const [crackError, setCrackError]           = useState<string | null>(null);
  const [copied, setCopied]                   = useState(false);
  const router = useRouter();

  // Native share sheet where available (mobile / supported browsers), with a
  // clipboard-copy fallback everywhere else — no backend involved, so a
  // locked/unlocked fortune can be shared the instant it's on screen.
  const handleShare = async () => {
    if (!fortune) return;
    const shareText = `🥠 "${fortune}" — shared from Gleam`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ text: shareText, title: "My fortune cookie" });
      } catch {
        // user canceled the share sheet — not an error
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked (permissions, insecure context) — silently no-op
    }
  };

  useEffect(() => {
    fortuneApi.today()
      .then((r) => {
        setFortune(r.fortune ?? null);
        setUnlocked(r.unlocked ?? false);
        setMessage(r.message ?? null);
        setCracksRemaining(r.cracksRemaining ?? 0);
        setCracksTotal(r.cracksTotal ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getNew = async () => {
    if (cracksRemaining <= 0) return;
    setFetching(true);
    setCrackError(null);
    try {
      const r = await fortuneApi.random();
      setFortune(r.fortune ?? null);
      setCracksRemaining(r.cracksRemaining ?? 0);
    } catch (e: any) {
      console.error(e);
      setCrackError(e.message || "You've used all your fortune cracks for today. Come back tomorrow! 🥠");
      setCracksRemaining(0);
    }
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

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <motion.button
              whileHover={cracksRemaining > 0 ? { scale: 1.04, boxShadow: "0 8px 28px rgba(245,158,11,0.35)" } : {}}
              whileTap={cracksRemaining > 0 ? { scale: 0.97 } : {}}
              onClick={getNew}
              disabled={fetching || cracksRemaining <= 0}
              style={{
                background: cracksRemaining > 0 ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : "#e5e7eb",
                color: cracksRemaining > 0 ? "#fff" : "#9ca3af", border: "none", borderRadius: 14,
                padding: "0.85rem 2.25rem", fontSize: "0.95rem",
                fontWeight: 700, cursor: (fetching || cracksRemaining <= 0) ? "not-allowed" : "pointer",
                fontFamily: "'Sora', sans-serif",
                boxShadow: cracksRemaining > 0 ? "0 4px 20px rgba(245,158,11,0.25)" : "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {fetching ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>🥠</motion.span>
                  Cracking…
                </>
              ) : cracksRemaining > 0 ? (
                <>🥠 Crack a New One</>
              ) : (
                <>🔒 No Cracks Left</>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              style={{
                background: copied ? "#ecfdf5" : "#fff",
                color: copied ? "#059669" : "#92400e",
                border: `1.5px solid ${copied ? "#a7f3d0" : "#fde68a"}`,
                borderRadius: 14,
                padding: "0.85rem 1.75rem", fontSize: "0.95rem",
                fontWeight: 700, cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {copied ? (<><FaCheck size={13} /> Copied!</>) : (<><FaShareAlt size={13} /> Share</>)}
            </motion.button>
          </div>

          <p style={{ marginTop: 12, fontSize: "0.82rem", color: "#9ca3af" }}>
            {cracksRemaining > 0
              ? `${cracksRemaining} of ${cracksTotal} extra cracks left today`
              : "Come back tomorrow for more fortunes 🥠"}
          </p>
          {crackError && (
            <p style={{ marginTop: 4, fontSize: "0.8rem", color: "#dc2626" }}>{crackError}</p>
          )}
        </>
      )}
    </div>
  );
}
