"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiSmileyMeltingFill } from "react-icons/pi";
import "@/styles/Header.css"
export default function HeaderSection() {
  const [isSticky, setSticky] = useState(1);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = 100;
      setSticky(Math.max(1 - scrollTop / maxScroll, 0.6));
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const pathname = usePathname();
  return (
    <>
      <header className="header-section" style={{ opacity: isSticky }}>
        <div className="header-section-div">
          {/* side 1 */}
          <div className="left-side">
            <PiSmileyMeltingFill className="logo-icon"/>
            <h3>GLEAM</h3>
          </div>

          {/* side 2 */}
          <nav className="middle-side">
            <ul>
              <li className={pathname === "/" ? "active" : ""}>
                <Link href="/">HOME</Link>
              </li>

              <li className={pathname.startsWith("/about-us") || pathname.startsWith("/story") ? "active" : ""}>
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

          {/* side 3 */}
          <div className="right-side">
            <button
              className="login-btn"
              onClick={() => (window.location.href = "/auth/log-in")}
            >
              Log In
            </button>

            <button
              className="signup-btn"
              onClick={() => (window.location.href = "/auth/sign-up")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
