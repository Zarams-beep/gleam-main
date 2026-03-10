"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setActiveItem, toggleCollapse } from "@/store/slices/sidebarSlices_";
import { useCallback, useEffect, useState } from "react";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { useRouter, usePathname } from "next/navigation";
import "@/styles/Dashboard.css";

export default function DashboardSidebar() {
  const { items, isCollapsed } = useSelector((state: RootState) => state.sidebar);
  const dispatch = useDispatch();
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useSelector((state: RootState) => (state as any).user?.user);
  const isAdmin  = ["super_admin", "admin", "org_admin"].includes(user?.role ?? "");
  const visibleItems = items.filter((item: any) => !item.adminOnly || isAdmin);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync active item from URL on every navigation
  useEffect(() => {
    const match = items.find((item: any) =>
      item.path &&
      (pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path)))
    );
    if (match) dispatch(setActiveItem(match.id));
  }, [pathname, items, dispatch]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && isCollapsed) dispatch(toggleCollapse());
  }, [isMobile, isCollapsed, dispatch]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isCollapsed) dispatch(toggleCollapse());
  }, [isMobile, isCollapsed, dispatch]);

  const handleItemClick = (item: any) => {
    dispatch(setActiveItem(item.id));
    if (item.path) router.push(item.path);
  };

  // Derive active from pathname for instant visual feedback
  const getActive = (item: any) =>
    item.path === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.path ?? "__never__");

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : "expanded"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="side-bar-header">
        <PiSmileyMeltingFill className="logo-icon" />
        {!isCollapsed && <h3>GLEAM</h3>}
      </div>

      <div className="sidebar-main-item">
        {visibleItems.map((item: any) => {
          const Icon    = item.icon;
          const active  = getActive(item);
          return (
            <div
              key={item.id}
              className={`sidebar-item ${active ? "active-sidebar" : ""}`}
              onClick={() => handleItemClick(item)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="icon" />
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
