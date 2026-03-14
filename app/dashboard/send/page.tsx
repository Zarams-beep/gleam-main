// app/dashboard/send/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store/hooks";
import { userApi, complimentApi } from "@/utils/api";
import { OrgMember } from "@/types/auth";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaPaperPlane, FaSearch } from "react-icons/fa";
import { PiCoinsLight } from "react-icons/pi";
import { RiInformationLine } from "react-icons/ri";

const COMPLIMENT_STARTERS = [
  "Your work on the last project was outstanding. ",
  "I really appreciate how you always ",
  "The way you handled that situation showed real leadership. ",
  "Your creativity and dedication truly ",
  "Thank you for always going the extra mile when ",
];

export default function SendPage() {
  useSession();
  const user = useAppSelector((s) => s.user.user);

  const [query, setQuery]         = useState("");
  const [allMembers, setAllMembers] = useState<OrgMember[]>([]);
  const [results, setResults]     = useState<OrgMember[]>([]);
  const [selected, setSelected]   = useState<OrgMember | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [content, setContent]     = useState("");
  const [sending, setSending]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);

  // Load ALL org members on mount
  useEffect(() => {
    if (!user?.orgId) return;
    userApi.search("", undefined).then((res: any) => {
      setAllMembers(res.members ?? []);
    }).catch(() => {});
  }, [user?.orgId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setSelected(null);
    setDropdownOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults(allMembers);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const lower = q.toLowerCase();
      setResults(
        allMembers.filter(
          (m) =>
            m.full_name.toLowerCase().includes(lower) ||
            (m.department ?? "").toLowerCase().includes(lower)
        )
      );
    }, 200);
  }, [allMembers]);

  const handleFocus = () => {
    setDropdownOpen(true);
    setResults(query.trim() ? results : allMembers);
  };

  const handleSelect = (m: OrgMember) => {
    setSelected(m);
    setQuery(m.full_name);
    setDropdownOpen(false);
  };

  const handleSend = async () => {
    if (!selected || !content.trim()) return;
    setSending(true);
    setError(null);
    try {
      await complimentApi.send({ recipientId: selected.id, content: content.trim() });
      setSuccess(true);
      setSelected(null);
      setContent("");
      setQuery("");
      setResults(allMembers);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to send compliment.");
    } finally {
      setSending(false);
    }
  };

  const displayList = query.trim() ? results : allMembers;

  return (
    <div style={{ padding: "1.75rem", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
          }}>
            <FaPaperPlane style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
              Send a Compliment ✨
            </h1>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.82rem" }}>
              {user?.orgId
                ? `Sending within ${user?.department ? user.department + " · " : ""}your organisation`
                : "Join an organisation to send compliments to teammates"}
            </p>
          </div>
        </div>
      </motion.div>

      {!user?.orgId ? (
        <div style={{ background: "#fef3c7", borderRadius: 12, padding: "1.5rem", color: "#92400e" }}>
          <RiInformationLine size={20} style={{ display: "inline", marginRight: 8 }} />
          You need to join or create an organisation before you can send compliments.
        </div>
      ) : (
        <>
          {/* Success banner */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "#d1fae5", borderRadius: 10, padding: "1rem 1.5rem", color: "#065f46", marginBottom: "1.5rem" }}
              >
                🎉 Compliment sent! Keep spreading the good vibes.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recipient search */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "#374151", display: "block", marginBottom: 8 }}>
              Who are you complimenting?
            </label>

            <div ref={wrapperRef} style={{ position: "relative" }}>
              {/* Input */}
              <div style={{ position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", zIndex: 1 }} />
                <input
                  type="text"
                  placeholder={`Search from ${allMembers.length} teammate${allMembers.length !== 1 ? "s" : ""}...`}
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={handleFocus}
                  style={{
                    width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem",
                    border: "1.5px solid #e5e7eb", borderRadius: dropdownOpen ? "10px 10px 0 0" : 10,
                    fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                    transition: "border-radius 0.15s",
                  }}
                />
              </div>

              {/* Dropdown — always shows all members, filters on type */}
              <AnimatePresence>
                {dropdownOpen && !selected && displayList.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      listStyle: "none", margin: 0, padding: 0,
                      border: "1.5px solid #e5e7eb", borderTop: "none",
                      borderRadius: "0 0 10px 10px", background: "#fff",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      maxHeight: 280, overflowY: "auto",
                      position: "absolute", width: "100%", zIndex: 50,
                    }}
                  >
                    {displayList.map((m) => (
                      <li
                        key={m.id}
                        onMouseDown={() => handleSelect(m)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "0.7rem 1rem", cursor: "pointer",
                          borderBottom: "1px solid #f3f4f6", transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        {m.image ? (
                          <Image src={m.image} alt={m.full_name} width={36} height={36}
                            style={{ borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
                          }}>
                            {m.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>{m.full_name}</p>
                          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                            {m.department ?? "No department"}
                          </p>
                        </div>
                        {m.coins !== undefined && (
                          <span style={{ fontSize: "0.75rem", color: "#a855f7", fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                            <PiCoinsLight style={{ fontSize: 13 }} /> {m.coins}
                          </span>
                        )}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Selected pill */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, marginTop: 10,
                    background: "#ede9fe", borderRadius: 12, padding: "0.75rem 1rem",
                  }}
                >
                  {selected.image ? (
                    <Image src={selected.image} alt={selected.full_name} width={40} height={40}
                      style={{ borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: "1rem", flexShrink: 0,
                    }}>
                      {selected.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>{selected.full_name}</p>
                    <p style={{ fontSize: "0.8rem", color: "#7c3aed", margin: 0 }}>
                      {selected.department ?? "No department"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setQuery(""); setDropdownOpen(false); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: "1.2rem", lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "#374151", display: "block", marginBottom: 8 }}>
              Your message
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {COMPLIMENT_STARTERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setContent(s)}
                  style={{
                    fontSize: "0.75rem", padding: "4px 10px", borderRadius: 20,
                    border: "1.5px solid #ddd6fe",
                    background: content.startsWith(s) ? "#ede9fe" : "#fff",
                    color: "#7c3aed", cursor: "pointer",
                  }}
                >
                  {s.length > 32 ? s.slice(0, 32) + "…" : s}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Write your compliment here... be specific and genuine!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={500}
              style={{
                width: "100%", padding: "0.9rem 1rem", border: "1.5px solid #e5e7eb",
                borderRadius: 10, fontSize: "0.95rem", resize: "vertical",
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "right", marginTop: 4 }}>
              {content.length}/500
            </p>
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.9rem", marginBottom: 12 }}>
              <RiInformationLine style={{ display: "inline", marginRight: 4 }} />
              {error}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSend}
            disabled={!selected || !content.trim() || sending}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: (!selected || !content.trim()) ? "#e5e7eb" : "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: (!selected || !content.trim()) ? "#9ca3af" : "#fff",
              border: "none", borderRadius: 12, padding: "0.9rem 2rem",
              fontSize: "1rem", fontWeight: 600,
              cursor: (!selected || !content.trim()) ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <FaPaperPlane />
            {sending ? "Sending…" : "Send Compliment"}
          </motion.button>
        </>
      )}
    </div>
  );
}
