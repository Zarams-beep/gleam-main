"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drawer } from "@mui/material";
import { CiMenuBurger } from "react-icons/ci";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { FaXmark } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import "@/styles/Header.css";
import { useSession, signOut } from "next-auth/react";

export default function MediaHeaderSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session, status } = useSession();

  const navLinks = [
    { text: "HOME",    href: "/" },
    { text: "ABOUT",   href: "/about-us" },
    { text: "BLOG",    href: "/blog" },
    { text: "CONTACT", href: "/contact-us" },
  ];

  const go = (href: string) => { setDrawerOpen(false); router.push(href); };

  const initials = (session?.user?.fullName || session?.user?.name || "U")
    .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <header className="header-section">
        <div className="header-section-div container">
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "inherit" }}>
            <PiSmileyMeltingFill className="logo-icon" />
            <h3>GLEAM</h3>
          </Link>

          {/* Burger */}
          <div onClick={() => setDrawerOpen(true)} aria-label="menu" style={{ cursor: "pointer" }}>
            <CiMenuBurger className="burger-menu" />
          </div>
        </div>
      </header>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="drawer-container">
          {/* Close */}
          <motion.div
            onClick={() => setDrawerOpen(false)}
            aria-label="close"
            className="menu-icon-container"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            style={{ cursor: "pointer" }}
          >
            <FaXmark className="burger-menu" />
          </motion.div>

          {/* If logged in — show user card */}
          {status === "authenticated" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 0 1.5rem", marginBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%", background: "#5b50e8",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}>
                {session.user?.image
                  ? <Image src={session.user.image} alt="avatar" width={44} height={44} style={{ objectFit: "cover" }} />
                  : <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}>{initials}</span>
                }
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>
                  {session.user?.fullName || session.user?.name}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.65 }}>{session.user?.email}</p>
              </div>
            </motion.div>
          )}

          {/* Nav links */}
          <AnimatePresence>
            <motion.ul
              initial="hidden" animate="show" exit="hidden"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}
            >
              {navLinks.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.35 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => go(link.href)}
                    className={pathname === link.href ? "active" : ""}
                    style={{ width: "100%", textAlign: "left" }}
                  >
                    {link.text}
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>

          {/* Auth actions */}
          <div className="drawer-btn">
            {status === "loading" ? (
              <div style={{ opacity: 0.5, fontSize: "0.875rem" }}>Loading…</div>
            ) : status === "authenticated" ? (
              <>
                {/* Go to Dashboard */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => go("/dashboard")}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    background: "rgba(91,80,232,0.85)", color: "#fff",
                    border: "none", borderRadius: 10, padding: "0.75rem",
                    fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
                  }}
                >
                  <MdDashboard style={{ fontSize: 18 }} />
                  Go to Dashboard
                </motion.button>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { signOut({ callbackUrl: "/" }); setDrawerOpen(false); }}
                  className="login-btn"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <IoLogOutOutline style={{ fontSize: 16 }} />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="login-btn"
                  onClick={() => go("/login")}
                >
                  Log In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="signup-btn"
                  onClick={() => go("/sign-up")}
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
