"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MdDashboard } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import Image from "next/image";
import "@/styles/Header.css";

export default function HeaderSection() {
  const [isSticky, setSticky] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const maxScroll = 100;
      setSticky(Math.max(1 - window.scrollY / maxScroll, 0.6));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".header-user-menu")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <motion.header
      className="header-section"
      animate={{ opacity: isSticky }}
      transition={{ duration: 0.3 }}
    >
      <div className="container">
        <div className="header-section-div">

          {/* Logo */}
          <motion.div
            className="left-side"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "inherit" }}>
              <PiSmileyMeltingFill className="logo-icon" />
              <h3>GLEAM</h3>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="middle-side">
            <ul>
              {[
                { label: "HOME",    href: "/" },
                { label: "ABOUT",   href: "/about-us" },
                { label: "BLOG",    href: "/blog" },
                { label: "CONTACT", href: "/contact-us" },
              ].map(({ label, href }) => (
                <motion.li
                  key={href}
                  whileHover={{ scale: 1.05 }}
                  className={pathname === href || (href !== "/" && pathname.startsWith(href)) ? "active" : ""}
                >
                  <Link href={href}>{label}</Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Auth section */}
          <div className="right-side">
            {status === "loading" ? (
              <div className="header-skeleton" />
            ) : status === "authenticated" ? (
              /* ── Logged-in: avatar + dropdown ── */
              <div className="header-user-menu" style={{ position: "relative" }}>
                <motion.button
                  className="header-user-btn"
                  onClick={() => setDropdownOpen((p) => !p)}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    background: "rgba(255,255,255,0.12)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    borderRadius: 40, padding: "5px 14px 5px 6px",
                    cursor: "pointer", color: "inherit",
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", background: "#5b50e8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="avatar" width={30} height={30} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    ) : (
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fff" }}>
                        {(session.user?.fullName || session.user?.name || "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.user?.fullName || session.user?.name || "User"}
                  </span>
                  <span style={{ fontSize: "10px", opacity: 0.7 }}>▼</span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute", top: "calc(100% + 10px)", right: 0,
                        background: "#fff", borderRadius: 14, minWidth: 200,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                        border: "1px solid #f0eeff", overflow: "hidden", zIndex: 9999,
                      }}
                    >
                      {/* User info */}
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                        <p style={{ fontWeight: 700, color: "#1a1740", margin: 0, fontSize: "0.9rem" }}>
                          {session.user?.fullName || session.user?.name}
                        </p>
                        <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.78rem" }}>{session.user?.email}</p>
                      </div>

                      {/* Go to Dashboard */}
                      <button
                        onClick={() => { router.push("/dashboard"); setDropdownOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 16px", background: "none", border: "none",
                          cursor: "pointer", color: "#1a1740", fontSize: "0.875rem",
                          fontWeight: 600, transition: "background 0.15s", textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <MdDashboard style={{ color: "#5b50e8", fontSize: 18 }} />
                        Go to Dashboard
                      </button>

                      {/* Logout */}
                      <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 16px", background: "none", border: "none",
                          cursor: "pointer", color: "#ef4444", fontSize: "0.875rem",
                          fontWeight: 600, borderTop: "1px solid #f3f4f6", textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <IoLogOutOutline style={{ fontSize: 18 }} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Logged out ── */
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/login")}
                  className="login-btn"
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="signup-btn"
                  onClick={() => router.push("/sign-up")}
                >
                  Register
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
