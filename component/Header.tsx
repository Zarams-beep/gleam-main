"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import "@/styles/Header.css";

export default function HeaderSection() {
  const [isSticky, setSticky] = useState(1);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = 100;
      setSticky(Math.max(1 - scrollTop / maxScroll, 0.6));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
            <PiSmileyMeltingFill className="logo-icon" />
            <h3>GLEAM</h3>
          </motion.div>

          {/* Navigation */}
          <nav className="middle-side">
            <ul>
              <motion.li
                whileHover={{ scale: 1.05 }}
                className={pathname === "/" ? "active" : ""}
              >
                <Link href="/">HOME</Link>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05 }}
                className={
                  pathname.startsWith("/about-us") || pathname.startsWith("/story")
                    ? "active"
                    : ""
                }
              >
                <Link href="/about-us">ABOUT</Link>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05 }}
                className={pathname === "/blog" ? "active" : ""}
              >
                <Link href="/blog">BLOG</Link>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05 }}
                className={pathname === "/contact-us" ? "active" : ""}
              >
                <Link href="/contact-us">CONTACT</Link>
              </motion.li>
            </ul>
          </nav>

          {/* Auth section */}
          <div className="right-side">
            {status === "authenticated" ? (
              <>
                <motion.span
                  className="user-welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Welcome, {session?.user?.fullName || session?.user?.name || "User"} 👋
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="login-btn"
                >
                  Logout
                </motion.button>
              </>
            ) : status === "loading" ? (
              <span>Loading...</span>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signIn()}
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
