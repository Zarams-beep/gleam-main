"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { motion } from "framer-motion";
import "@/styles/Dashboard.css";
import { IoIosSearch } from "react-icons/io";
import { GoBell } from "react-icons/go";
export default function DashboardNavBarPage() {
  const [isSticky, setSticky] = useState<number>(1);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Sticky effect on scroll
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

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <motion.header
      className="dashboard-header-section"
      animate={{ opacity: isSticky }}
      transition={{ duration: 0.3 }}
    >
      <div className="main-dashboard-container">
        <div className="dashboard-header-section-div">
          {/* Center: Search bar */}
          <div className="search-container">
            <IoIosSearch className="search-icon"/>
            <input
              type="text"
              placeholder="Search..."
              className=""
            />
          </div>

          {/* Right side */}
          {session && (
            <div className="dashboard-navbar-right" ref={dropdownRef}>
              {/* Notifications */}
              <button className="notification">
                <span className="">2</span>
                <GoBell className="notification-icon"/>
              </button>

              {/* User info + dropdown */}
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="button-first"
              >
                <div className="img-container">
                  <Image
                  src={session.user?.image || "/jason-leung-uhxiOmoVhOo-unsplash.jpg"}
                  alt={`${session.user?.fullName || session.user?.name}`}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                </div>
                <span className="">
                  {session.user?.fullName || session.user?.name}
                </span>
                {isDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="dashboard-drop-down"
                >
                  <button
                    onClick={() => router.push("/dashboard/profile")}
                    className=""
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/settings")}
                    className=""
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="logout"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
