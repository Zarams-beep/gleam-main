// app/dashboard/inbox/page.tsx
"use client";
import { useState, useEffect } from "react";
import { complimentApi } from "@/utils/api";
import { Compliment } from "@/types/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FaInbox } from "react-icons/fa";
import { MdMarkEmailRead } from "react-icons/md";

const REACTIONS = ["❤️", "😊", "🙌", "✨"];

export default function InboxPage() {
  const [compliments, setCompliments] = useState<Compliment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [reacting, setReacting]       = useState<string | null>(null);

  const fetchCompliments = async (p = 1) => {
    setLoading(true);
    try {
      const res = await complimentApi.received(p, 10);
      const items: Compliment[] = res.compliments ?? [];
      setCompliments((prev) => p === 1 ? items : [...prev, ...items]);
      setHasMore(items.length === 10);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompliments(1); }, []);

  const handleReact = async (id: string, reaction: string) => {
    setReacting(id);
    try {
      await complimentApi.react(id, reaction);
      setCompliments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, reaction: reaction as any } : c))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setReacting(null);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ padding: "1.75rem", maxWidth: 720, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #5b50e8, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(91,80,232,0.25)",
          }}>
            <FaInbox style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
              Inbox
            </h1>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.82rem" }}>Compliments sent to you by your teammates</p>
          </div>
        </div>
      </motion.div>

      {loading && compliments.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "#f3f4f6", borderRadius: 12, height: 100, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : compliments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#9ca3af" }}>
          <MdMarkEmailRead size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No compliments yet — keep being awesome and they'll come!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <AnimatePresence>
            {compliments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: c.is_read ? "#fff" : "#faf5ff",
                  border: `1.5px solid ${c.is_read ? "#e5e7eb" : "#ddd6fe"}`,
                  borderRadius: 14, padding: "1.25rem 1.5rem",
                  boxShadow: c.is_read ? "none" : "0 2px 12px rgba(124,58,237,0.07)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    {!c.is_read && (
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed",
                        background: "#ede9fe", borderRadius: 20, padding: "2px 8px", marginBottom: 8, display: "inline-block",
                      }}>
                        NEW
                      </span>
                    )}
                    <p style={{ margin: "6px 0 10px", fontSize: "0.95rem", color: "#1f2937", lineHeight: 1.6 }}>
                      "{c.content}"
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0 }}>
                      {c.department && <span style={{ marginRight: 8 }}>📍 {c.department}</span>}
                      {timeAgo(c.created_at)}
                    </p>
                  </div>

                  {/* Reaction */}
                  <div style={{ marginLeft: 16, display: "flex", gap: 4, flexShrink: 0 }}>
                    {REACTIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleReact(c.id, r)}
                        disabled={reacting === c.id}
                        style={{
                          fontSize: "1.2rem", background: c.reaction === r ? "#ede9fe" : "transparent",
                          border: `1.5px solid ${c.reaction === r ? "#ddd6fe" : "transparent"}`,
                          borderRadius: 8, padding: "4px 6px", cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <button
              onClick={() => { const next = page + 1; setPage(next); fetchCompliments(next); }}
              style={{
                marginTop: 8, padding: "0.75rem", borderRadius: 10,
                border: "1.5px solid #ddd6fe", background: "#fff", color: "#7c3aed",
                cursor: "pointer", fontWeight: 600,
              }}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
