"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drawer } from "@mui/material"; // Keeping Drawer, removing List components
import { CiMenuBurger } from "react-icons/ci";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/Header.css";
import { useSession, signIn, signOut } from "next-auth/react";
export default function MediaHeaderSection() {
  // const [isSticky, setSticky] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const navLinks = [
    { text: "HOME", href: "/" },
    { text: "ABOUT", href: "/about-us" },
    { text: "BLOG", href: "/blog" },
    { text: "CONTACT", href: "/contact-us" },
  ];

  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   const handleScroll = () => {
  //     const scrollTop = window.scrollY;
  //     const maxScroll = 100;
  //     setSticky(Math.max(1 - scrollTop / maxScroll, 0.6));
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <>
      <header className="header-section">
        <div className="header-section-div container">
          {/* Logo */}
          <div className="left-side">
            <PiSmileyMeltingFill className="logo-icon" />
            <h3>GLEAM</h3>
          </div>

          {/* Mobile Menu Button */}
          <div onClick={() => setDrawerOpen(true)} aria-label="menu">
            <CiMenuBurger className="burger-menu" />
          </div>
        </div>
      </header>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="drawer-main-container"
      >
        <div className="drawer-container">
          {/* Close Icon with animation */}
          <motion.div
            onClick={() => setDrawerOpen(false)}
            aria-label="close"
            className="menu-icon-container"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <FaXmark className="burger-menu" />
          </motion.div>

          {/* Navigation Links with staggered animation */}
          <AnimatePresence>
            <motion.ul
              className=""
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {navLinks.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, x: 30 },
                    show: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setDrawerOpen(false);
                      router.push(link.href);
                    }}
                    className={`${pathname === link.href ? "active" : ""}`}
                  >
                    {link.text}
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>

          {/* Auth Buttons */}
          <div className="drawer-btn">
            {status === "authenticated" ? (
              <>
                <span className="user-welcome">
                  Welcome,{" "}
                  {session?.user?.fullName || session?.user?.name || "User"} 👋
                </span>
                <button onClick={() => signOut()} className="login-btn">
                  Logout
                </button>
              </>
            ) : status === "loading" ? (
              <span>Loading...</span>
            ) : (
              <>
                            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="login-btn"
              onClick={() => {
                setDrawerOpen(false);
                router.push("/log-in");
              }}
            >
              Log In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="signup-btn"
              onClick={() => {
                setDrawerOpen(false);
                router.push("/sign-up");
              }}
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
