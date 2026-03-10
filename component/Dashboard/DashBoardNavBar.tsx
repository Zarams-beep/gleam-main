// component/Dashboard/DashBoardNavBar.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { IoIosSearch } from "react-icons/io";
import { GoBell } from "react-icons/go";
import { FiSettings, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveItem } from "@/store/slices/sidebarSlices_";
import { userApi } from "@/utils/api";
import { OrgMember } from "@/types/auth";

export default function DashboardNavBarPage() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<OrgMember[]>([]);
  const [searchOpen, setSearchOpen]       = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const router   = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const unread   = useAppSelector((s) => s.stats.stats?.unreadCompliments ?? 0);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await userApi.search(q);
        setSearchResults(res.members ?? []);
        setSearchOpen(true);
      } catch { setSearchResults([]); }
    }, 350);
  }, []);

  if (status === "loading") return null;

  const initials = (session?.user?.fullName || session?.user?.name || "U")
    .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  // Navigate to inbox AND set sidebar active item
  const goToInbox = () => {
    dispatch(setActiveItem("inbox"));
    router.push("/dashboard/inbox");
  };

  return (
    <header style={{
      background: "#0f0e1a",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "0 20px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      position: "sticky",
      top: 0,
      zIndex: 100,
      fontFamily: "'DM Sans', sans-serif",
      flexShrink: 0,
    }}>

      {/* ── Search ── */}
      <div ref={searchRef} style={{ position: "relative", flex: "1 1 0", minWidth: 0, maxWidth: 640 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1.5px solid rgba(255,255,255,0.10)",
          borderRadius: 10, padding: "0 12px", height: 38,
        }}>
          <IoIosSearch style={{ color: "rgba(255,255,255,0.35)", fontSize: 16, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search teammates..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: "0.85rem", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>

        <AnimatePresence>
          {searchOpen && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute", top: "calc(100% + 6px)",
                left: 0, right: 0,
                background: "#fff", borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                border: "1.5px solid #f0eeff",
                overflow: "hidden", zIndex: 9999,
              }}
            >
              {searchResults.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => { router.push(`/dashboard/send?to=${m.id}`); setSearchOpen(false); setSearchQuery(""); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", background: "none", border: "none",
                    borderTop: i > 0 ? "1px solid #f5f3ff" : "none",
                    cursor: "pointer", textAlign: "left", transition: "background 0.12s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#faf9ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    overflow: "hidden", background: "#ede9fe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {m.image
                      ? <Image src={m.image} alt={m.full_name} width={30} height={30} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      : <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#7c3aed" }}>
                          {m.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </span>
                    }
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.84rem", color: "#1a1740" }}>{m.full_name}</p>
                    {m.department && <p style={{ margin: 0, fontSize: "0.72rem", color: "#9ca3af" }}>{m.department}</p>}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: bell + user ── */}
      {session && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} ref={dropdownRef}>

          {/* Bell — properly syncs sidebar active item */}
          <button
            onClick={goToInbox}
            style={{
              position: "relative", width: 38, height: 38,
              background: pathname === "/dashboard/inbox"
                ? "rgba(91,80,232,0.25)"
                : "rgba(255,255,255,0.06)",
              border: `1.5px solid ${pathname === "/dashboard/inbox" ? "rgba(91,80,232,0.5)" : "rgba(255,255,255,0.10)"}`,
              borderRadius: 10, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
              color: pathname === "/dashboard/inbox" ? "#a5b4fc" : "rgba(255,255,255,0.6)",
              transition: "all 0.2s", flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (pathname !== "/dashboard/inbox")
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)";
            }}
            onMouseLeave={(e) => {
              if (pathname !== "/dashboard/inbox")
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            }}
          >
            <GoBell style={{ fontSize: 17 }} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: -3, right: -3,
                background: "#ef4444", color: "#fff",
                fontSize: "0.55rem", fontWeight: 800,
                borderRadius: "50%", width: 15, height: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #0f0e1a",
              }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Avatar pill */}
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.10)",
              borderRadius: 10, padding: "5px 10px 5px 5px",
              cursor: "pointer", color: "#fff", transition: "background 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
          >
            <div style={{
              width: 27, height: 27, borderRadius: "50%", background: "#5b50e8",
              flexShrink: 0, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {session.user?.image
                ? <Image src={session.user.image} alt="avatar" width={27} height={27} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                : <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#fff" }}>{initials}</span>
              }
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {(session.user?.fullName || session.user?.name || "").split(" ")[0]}
            </span>
            <FiChevronDown style={{ fontSize: 11, opacity: 0.5, transform: isDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.13 }}
                style={{
                  position: "absolute", top: 68, right: 16,
                  background: "#fff", borderRadius: 14,
                  minWidth: 200, boxShadow: "0 8px 40px rgba(0,0,0,0.16)",
                  border: "1.5px solid #f0eeff", overflow: "hidden", zIndex: 9999,
                }}
              >
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #f5f3ff", background: "#faf9ff" }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#1a1740", fontSize: "0.85rem" }}>
                    {session.user?.fullName || session.user?.name}
                  </p>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.73rem" }}>{session.user?.email}</p>
                </div>
                <NavDropItem icon={<FiUser />} iconColor="#7c3aed" label="Profile"  onClick={() => { router.push("/dashboard/profile");  dispatch(setActiveItem("profile"));  setDropdownOpen(false); }} />
                <NavDropItem icon={<FiSettings />} iconColor="#5b50e8" label="Settings" onClick={() => { router.push("/dashboard/settings"); dispatch(setActiveItem("settings")); setDropdownOpen(false); }} />
                <div style={{ borderTop: "1px solid #f5f3ff" }}>
                  <NavDropItem icon={<FiLogOut />} iconColor="#ef4444" label="Logout" color="#ef4444" hoverBg="#fef2f2" onClick={() => signOut({ callbackUrl: "/login" })} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </header>
  );
}

function NavDropItem({ icon, iconColor = "#5b50e8", label, onClick, color = "#1a1740", hoverBg = "#faf9ff" }: {
  icon: React.ReactNode; iconColor?: string; label: string;
  onClick: () => void; color?: string; hoverBg?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", background: "none", border: "none",
        cursor: "pointer", color, fontSize: "0.85rem", fontWeight: 600,
        textAlign: "left", transition: "background 0.12s",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = hoverBg)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
    >
      <span style={{ color: iconColor, fontSize: "0.95rem", flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}
