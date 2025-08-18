"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { useSession, signIn, signOut } from "next-auth/react"; // ⬅️ important
import "@/styles/Header.css";

export default function HeaderSection() {
  const [isSticky, setSticky] = useState(3);
  const { data: session, status } = useSession(); // ⬅️ session + status

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

  const pathname = usePathname();

  return (
    <header className="header-section" style={{ opacity: isSticky }}>
      <div className="container">
        <div className="header-section-div">
          {/* Logo */}
          <div className="left-side">
            <PiSmileyMeltingFill className="logo-icon" />
            <h3>GLEAM</h3>
          </div>

          {/* Navigation */}
          <nav className="middle-side">
            <ul>
              <li className={pathname === "/" ? "active" : ""}>
                <Link href="/">HOME</Link>
              </li>
              <li
                className={
                  pathname.startsWith("/about-us") || pathname.startsWith("/story")
                    ? "active"
                    : ""
                }
              >
                <Link href="/about-us">ABOUT</Link>
              </li>
              <li className={pathname === "/blog" ? "active" : ""}>
                <Link href="/blog">BLOG</Link>
              </li>
              <li className={pathname === "/contact-us" ? "active" : ""}>
                <Link href="/contact-us">CONTACT</Link>
              </li>
            </ul>
          </nav>

          {/* Auth section */}
          <div className="right-side">
            {status === "authenticated" ? (
              <>
                <span className="user-welcome">
                  Welcome, {session?.user?.fullName || session?.user?.name || "User"} 👋
                </span>
                <button onClick={() => signOut()} className="logout">
                  Logout
                </button>
              </>
            ) : status === "loading" ? (
              <span>Loading...</span>
            ) : (
              <>
                <button onClick={() => signIn()} className="logout">
                  Login
                </button>
                <Link href="/sign-up" className="register-link">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
