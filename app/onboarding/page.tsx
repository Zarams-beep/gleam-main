// app/onboarding/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { orgApi } from "@/utils/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setOrg } from "@/store/slices/orgSlice";
import { IoSearch, IoClose } from "react-icons/io5";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { FiCheck, FiChevronDown, FiArrowRight } from "react-icons/fi";
import { PiSmileyMeltingFill } from "react-icons/pi";

type Step = "search" | "department" | "done";

interface OrgResult {
  id: string;
  name: string;
  org_type: string;
  invite_code: string;
  member_count: number;
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.user.user);

  const [step, setStep]                 = useState<Step>("search");
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<OrgResult[]>([]);
  const [searching, setSearching]       = useState(false);
  const [selectedOrg, setSelectedOrg]   = useState<OrgResult | null>(null);
  const [departments, setDepartments]   = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [joining, setJoining]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If already in an org, skip onboarding
  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (user?.orgId) { router.replace("/dashboard"); }
  }, [status, user, router]);

  // Debounced org search
  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    setSelectedOrg(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim() || q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await orgApi.search(q);
        setSearchResults(res.orgs ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const selectOrg = async (org: OrgResult) => {
    setSelectedOrg(org);
    setSearchResults([]);
    setSearchQuery(org.name);
    setError(null);
    // Fetch departments for this org via lookup
    try {
      const res = await orgApi.lookup(org.invite_code);
      const depts = (res.org?.departments ?? []).map((d: any) => d.name).filter(Boolean);
      setDepartments(depts);
    } catch {
      setDepartments([]);
    }
  };

  const handleJoin = async () => {
    if (!selectedOrg) return;
    setJoining(true);
    setError(null);
    try {
      const res = await orgApi.join({
        inviteCode: selectedOrg.invite_code,
        department: selectedDept ?? undefined,
      });
      // Update Redux org state
      dispatch(setOrg({
        id:          res.org.id,
        name:        res.org.name,
        orgType:     res.org.orgType,
        inviteCode:  res.org.inviteCode,
        departments: res.org.departments ?? [],
        is_active:   true,
      }));
      setStep("done");
    } catch (e: any) {
      setError(e.message || "Failed to join organisation.");
    } finally {
      setJoining(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f4f3ff 0%, #faf9ff 50%, #ede9ff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Background decorative blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,80,232,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 8px 48px rgba(91,80,232,0.12)",
          border: "1.5px solid rgba(91,80,232,0.08)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo + skip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PiSmileyMeltingFill style={{ fontSize: 24, color: "#5b50e8" }} />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#1a1740" }}>GLEAM</span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#9ca3af", fontSize: "0.82rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#5b50e8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            Skip for now →
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step: search / pick org ── */}
          {step !== "done" && (
            <motion.div
              key="search-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "linear-gradient(135deg, #5b50e8, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, boxShadow: "0 6px 20px rgba(91,80,232,0.28)",
                }}>
                  <HiOutlineBuildingOffice2 style={{ color: "#fff", fontSize: 24 }} />
                </div>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.45rem", color: "#1a1740", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                  Join your organisation
                </h1>
                <p style={{ color: "#7b77a8", margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Search for your organisation by name. This lets you send compliments and connect with teammates.
                </p>
              </div>

              {/* Search input */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a1740", display: "block", marginBottom: 6, letterSpacing: "0.01em" }}>
                  Organisation name
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "#faf9ff", border: "1.5px solid #e4e2f8",
                    borderRadius: 12, padding: "0 14px", height: 48,
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                    onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#5b50e8"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px rgba(91,80,232,0.10)"; }}
                    onBlurCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e4e2f8"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                  >
                    <IoSearch style={{ color: "#9ca3af", fontSize: 18, flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Search organisations..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      style={{
                        flex: 1, border: "none", outline: "none", background: "transparent",
                        fontSize: "0.9rem", color: "#1a1740", fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                    {searchQuery && (
                      <button onClick={() => { setSearchQuery(""); setSearchResults([]); setSelectedOrg(null); setDepartments([]); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex" }}>
                        <IoClose size={16} />
                      </button>
                    )}
                  </div>

                  {/* Search results dropdown */}
                  <AnimatePresence>
                    {(searchResults.length > 0 || searching) && !selectedOrg && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                          background: "#fff", borderRadius: 14,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                          border: "1.5px solid #e4e2f8", overflow: "hidden", zIndex: 50,
                        }}
                      >
                        {searching ? (
                          <div style={{ padding: "1rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                            Searching...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div style={{ padding: "1rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                            No organisations found
                          </div>
                        ) : searchResults.map((org, i) => (
                          <button
                            key={org.id}
                            onClick={() => selectOrg(org)}
                            style={{
                              width: "100%", display: "flex", alignItems: "center", gap: 12,
                              padding: "12px 16px", background: "none", border: "none",
                              borderTop: i > 0 ? "1px solid #f5f3ff" : "none",
                              cursor: "pointer", textAlign: "left", transition: "background 0.12s",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#faf9ff")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <div style={{
                              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                              background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <HiOutlineBuildingOffice2 style={{ color: "#7c3aed", fontSize: 18 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#1a1740" }}>{org.name}</p>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af", textTransform: "capitalize" }}>
                                {org.org_type} · {org.member_count} member{org.member_count !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <FiArrowRight style={{ color: "#c4b5fd", flexShrink: 0 }} />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Selected org card */}
              <AnimatePresence>
                {selectedOrg && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "linear-gradient(135deg, #f5f3ff, #ede9ff)",
                      border: "1.5px solid #c4b5fd",
                      borderRadius: 14, padding: "1rem 1.25rem",
                      display: "flex", alignItems: "center", gap: 12,
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: "linear-gradient(135deg, #5b50e8, #818cf8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <HiOutlineBuildingOffice2 style={{ color: "#fff", fontSize: 20 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#1a1740", fontSize: "0.95rem" }}>{selectedOrg.name}</p>
                      <p style={{ margin: 0, color: "#7c3aed", fontSize: "0.78rem", textTransform: "capitalize", fontWeight: 600 }}>
                        {selectedOrg.org_type} · {selectedOrg.member_count} members
                      </p>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#5b50e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiCheck style={{ color: "#fff", fontSize: 13 }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Department picker — only shows if org selected and has departments */}
              <AnimatePresence>
                {selectedOrg && departments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: "1.25rem", overflow: "hidden" }}
                  >
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a1740", display: "block", marginBottom: 6 }}>
                      Department <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        background: "#faf9ff", border: "1.5px solid #e4e2f8",
                        borderRadius: 12, padding: "0 14px", height: 48,
                        transition: "border-color 0.2s",
                      }}>
                        <select
                          value={selectedDept ?? ""}
                          onChange={(e) => setSelectedDept(e.target.value || null)}
                          style={{
                            flex: 1, border: "none", outline: "none",
                            background: "transparent", fontSize: "0.9rem",
                            color: selectedDept ? "#1a1740" : "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            appearance: "none", WebkitAppearance: "none", cursor: "pointer",
                          }}
                        >
                          <option value="">Select your department...</option>
                          {departments.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <FiChevronDown style={{ color: "#9ca3af", fontSize: 16, pointerEvents: "none", flexShrink: 0 }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: 10, padding: "0.65rem 1rem",
                      color: "#dc2626", fontSize: "0.85rem", fontWeight: 600,
                      marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    ⚠️ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileHover={{ scale: selectedOrg ? 1.02 : 1 }}
                  whileTap={{ scale: selectedOrg ? 0.97 : 1 }}
                  onClick={handleJoin}
                  disabled={!selectedOrg || joining}
                  style={{
                    flex: 1, padding: "0.85rem",
                    background: !selectedOrg || joining
                      ? "#e8e6f4"
                      : "linear-gradient(135deg, #5b50e8, #7c6ef5)",
                    color: !selectedOrg || joining ? "#b0aed0" : "#fff",
                    border: "none", borderRadius: 14,
                    fontWeight: 700, fontSize: "0.95rem",
                    fontFamily: "'Sora', sans-serif",
                    cursor: !selectedOrg || joining ? "not-allowed" : "pointer",
                    boxShadow: selectedOrg && !joining ? "0 4px 20px rgba(91,80,232,0.30)" : "none",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {joining ? (
                    <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}>⚙️</motion.span> Joining…</>
                  ) : (
                    <>Join Organisation <FiArrowRight /></>
                  )}
                </motion.button>
              </div>

              <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#b0aed0", marginTop: "1rem", lineHeight: 1.5 }}>
                Don't see your organisation?{" "}
                <span style={{ color: "#5b50e8", fontWeight: 600, cursor: "pointer" }} onClick={() => router.push("/dashboard")}>
                  Skip and join later from your dashboard
                </span>
              </p>
            </motion.div>
          )}

          {/* ── Step: done ── */}
          {step === "done" && (
            <motion.div
              key="done-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{ textAlign: "center", padding: "1rem 0" }}
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: "2rem",
                  boxShadow: "0 6px 24px rgba(5,150,105,0.20)",
                }}
              >
                🎉
              </motion.div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#1a1740", margin: "0 0 8px" }}>
                You're in!
              </h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 8px" }}>
                Successfully joined <strong style={{ color: "#1a1740" }}>{selectedOrg?.name}</strong>
                {selectedDept && <> in the <strong style={{ color: "#1a1740" }}>{selectedDept}</strong> department</>}.
              </p>
              <p style={{ color: "#9ca3af", fontSize: "0.82rem", marginBottom: "2rem" }}>
                You can now send compliments and connect with your teammates. ✨
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/dashboard")}
                style={{
                  padding: "0.85rem 2.5rem",
                  background: "linear-gradient(135deg, #5b50e8, #7c6ef5)",
                  color: "#fff", border: "none", borderRadius: 14,
                  fontWeight: 700, fontSize: "0.95rem",
                  fontFamily: "'Sora', sans-serif", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(91,80,232,0.30)",
                }}
              >
                Go to Dashboard →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
