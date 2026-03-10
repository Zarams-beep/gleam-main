// app/dashboard/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { userApi } from "@/utils/api";
import { useAppDispatch } from "@/store/hooks";
import { clearStats } from "@/store/slices/statsSlice";
import { clearOrg } from "@/store/slices/orgSlice";
import { motion, AnimatePresence } from "framer-motion";
import { MdDeleteForever, MdOutlineWarningAmber } from "react-icons/md";
import { FiEye, FiEyeOff, FiSettings, FiUser, FiLogOut, FiChevronRight } from "react-icons/fi";

/* ── Portal modal so it ALWAYS renders above everything ── */
function Modal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function SettingsPage() {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep]           = useState<1 | 2>(1);
  const [password, setPassword]               = useState("");
  const [showPw, setShowPw]                   = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!password.trim()) { setDeleteError("Please enter your password."); return; }
    setDeleting(true);
    setDeleteError(null);
    try {
      await userApi.deleteAccount(password);
      dispatch(clearStats());
      dispatch(clearOrg());
      localStorage.removeItem("gleam_access_token");
      await signOut({ redirect: false });
      router.replace("/");
    } catch (e: any) {
      setDeleteError(e.message || "Incorrect password. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setDeleteStep(1);
    setPassword("");
    setDeleteError(null);
  };

  return (
    <div style={{ padding: "1.75rem", maxWidth: 560, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #1a1740 0%, #3d37a8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(26,23,64,0.25)",
          }}>
            <FiSettings style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#1a1740", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
              Settings
            </h1>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.82rem" }}>Manage your account preferences</p>
          </div>
        </div>
      </motion.div>

      {/* ── Account card ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px 4px" }}>
          Account
        </p>
        <div style={{
          background: "#fff", borderRadius: 18,
          border: "1.5px solid #f0eeff",
          boxShadow: "0 2px 16px rgba(91,80,232,0.06)",
          overflow: "hidden", marginBottom: "1.5rem",
        }}>
          <SettingsRow
            icon={<FiUser />}
            iconBg="#ede9fe" iconColor="#7c3aed"
            title="Edit Profile"
            description="Update your name and photo"
            onClick={() => router.push("/dashboard/profile")}
          />
          <SettingsRow
            icon={<FiLogOut />}
            iconBg="#fef2f2" iconColor="#ef4444"
            title="Sign Out"
            description="Log out of your Gleam account"
            onClick={() => signOut({ callbackUrl: "/" })}
            danger
          />
        </div>
      </motion.div>

      {/* ── Danger zone ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px 4px" }}>
          ⚠️ Danger Zone
        </p>
        <div style={{
          background: "#fff", borderRadius: 18,
          border: "1.5px solid #fee2e2",
          boxShadow: "0 2px 16px rgba(220,38,38,0.05)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem" }}>
                🗑️
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "#1a1740", margin: "0 0 3px", fontSize: "0.95rem" }}>Delete Account</p>
                <p style={{ color: "#9ca3af", margin: "0 0 14px", fontSize: "0.82rem", lineHeight: 1.5 }}>
                  Permanently delete your account and all your data. This cannot be undone.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#dc2626", color: "#fff",
                    border: "none", borderRadius: 12,
                    padding: "0.65rem 1.25rem",
                    cursor: "pointer", fontWeight: 700,
                    fontSize: "0.875rem",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 4px 14px rgba(220,38,38,0.30)",
                  }}
                >
                  <MdDeleteForever style={{ fontSize: 17 }} />
                  Delete Account
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Delete modal — rendered in a Portal so it's always on top ── */}
      <Modal>
        <AnimatePresence>
          {showDeleteModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                style={{
                  position: "fixed", inset: 0,
                  background: "rgba(15, 14, 26, 0.65)",
                  backdropFilter: "blur(6px)",
                  zIndex: 99998,
                }}
              />

              {/* Modal panel — wrapper handles centering, motion handles animation */}
              <div style={{
                position: "fixed", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "1rem", zIndex: 99999, pointerEvents: "none",
              }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  padding: "2rem",
                  width: "100%",
                  maxWidth: 420,
                  boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
                  pointerEvents: "all",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {deleteStep === 1 ? (
                  /* ── Step 1: Warning ── */
                  <>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                      <motion.div
                        initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        style={{
                          width: 64, height: 64, borderRadius: "50%",
                          background: "linear-gradient(135deg, #fee2e2, #fca5a5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 16px", fontSize: "1.75rem",
                          boxShadow: "0 4px 16px rgba(220,38,38,0.20)",
                        }}
                      >
                        ⚠️
                      </motion.div>
                      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: "#1a1740", margin: "0 0 6px", fontSize: "1.2rem" }}>
                        Delete your account?
                      </h2>
                      <p style={{ color: "#6b7280", margin: 0, fontSize: "0.875rem", lineHeight: 1.6 }}>
                        This action is permanent and cannot be reversed.
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
                      {[
                        "Your profile and personal data",
                        "All compliments sent and received",
                        "Coins, streak and performance history",
                        "Organisation membership",
                      ].map((item) => (
                        <div key={item} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          background: "#fef2f2", borderRadius: 10,
                          padding: "9px 12px", fontSize: "0.84rem", color: "#374151",
                        }}>
                          <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0, fontSize: "0.75rem" }}>✕</span>
                          {item}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={closeModal} style={{
                        flex: 1, padding: "0.75rem", borderRadius: 12,
                        border: "1.5px solid #e5e7eb", background: "#fff",
                        cursor: "pointer", fontWeight: 600, color: "#374151",
                        fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif",
                      }}>
                        Cancel
                      </button>
                      <button onClick={() => setDeleteStep(2)} style={{
                        flex: 1, padding: "0.75rem", borderRadius: 12,
                        border: "none", background: "#dc2626",
                        cursor: "pointer", fontWeight: 700, color: "#fff",
                        fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif",
                        boxShadow: "0 4px 12px rgba(220,38,38,0.28)",
                      }}>
                        Continue →
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── Step 2: Password ── */
                  <>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                      <motion.div
                        initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        style={{
                          width: 64, height: 64, borderRadius: "50%",
                          background: "linear-gradient(135deg, #ede9fe, #c4b5fd)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 16px", fontSize: "1.75rem",
                          boxShadow: "0 4px 16px rgba(91,80,232,0.20)",
                        }}
                      >
                        🔑
                      </motion.div>
                      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: "#1a1740", margin: "0 0 6px", fontSize: "1.2rem" }}>
                        Confirm with password
                      </h2>
                      <p style={{ color: "#6b7280", margin: 0, fontSize: "0.875rem" }}>
                        Enter your password to confirm deletion
                      </p>
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        border: `2px solid ${deleteError ? "#dc2626" : "#e4e2f8"}`,
                        borderRadius: 12, padding: "0.75rem 1rem",
                        background: deleteError ? "#fff5f5" : "#faf9ff",
                        transition: "all 0.2s",
                      }}>
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setDeleteError(null); }}
                          autoFocus
                          style={{
                            flex: 1, border: "none", outline: "none",
                            background: "transparent", fontSize: "0.9rem",
                            color: "#1a1740", fontFamily: "'DM Sans', sans-serif",
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((p) => !p)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 0 }}
                        >
                          {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                      {deleteError && (
                        <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                          <MdOutlineWarningAmber size={14} /> {deleteError}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => { setDeleteStep(1); setPassword(""); setDeleteError(null); }} style={{
                        flex: 1, padding: "0.75rem", borderRadius: 12,
                        border: "1.5px solid #e5e7eb", background: "#fff",
                        cursor: "pointer", fontWeight: 600, color: "#374151",
                        fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif",
                      }}>
                        ← Back
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDeleteAccount}
                        disabled={deleting || !password}
                        style={{
                          flex: 1, padding: "0.75rem", borderRadius: 12, border: "none",
                          background: deleting || !password ? "#fca5a5" : "#dc2626",
                          cursor: deleting || !password ? "not-allowed" : "pointer",
                          fontWeight: 700, color: "#fff", fontSize: "0.9rem",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          fontFamily: "'DM Sans', sans-serif",
                          boxShadow: deleting || !password ? "none" : "0 4px 12px rgba(220,38,38,0.28)",
                          transition: "background 0.2s, box-shadow 0.2s",
                        }}
                      >
                        {deleting ? (
                          <>
                            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}>⚙️</motion.span>
                            Deleting…
                          </>
                        ) : (
                          <><MdDeleteForever size={16} /> Delete Forever</>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
}

/* ── Reusable settings row ── */
function SettingsRow({ icon, iconBg, iconColor, title, description, onClick, danger = false }: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 14,
        padding: "1rem 1.25rem", background: "none", border: "none",
        borderTop: danger ? "1px solid #fff1f2" : "none",
        cursor: "pointer", textAlign: "left",
        transition: "background 0.15s", fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#fff5f5" : "#faf9ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1rem", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, color: danger ? "#dc2626" : "#1a1740", fontSize: "0.9rem" }}>{title}</p>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.78rem" }}>{description}</p>
      </div>
      <FiChevronRight style={{ color: "#d1d5db", fontSize: "1rem", flexShrink: 0 }} />
    </button>
  );
}
