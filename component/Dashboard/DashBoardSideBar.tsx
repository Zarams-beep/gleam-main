"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setActiveItem, toggleCollapse } from "@/store/slices/sidebarSlices_";
import { useCallback, useEffect, useState } from "react";
import { PiSmileyMeltingFill } from "react-icons/pi";
import "@/styles/Dashboard.css";

export default function DashboardSidebar() {
  const { items, isCollapsed, activeItem } = useSelector(
    (state: RootState) => state.sidebar
  );
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 600);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Expand on hover (desktop only)
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && isCollapsed) {
      dispatch(toggleCollapse());
    }
  }, [isMobile, isCollapsed, dispatch]);

  // Collapse on leave (desktop only)
  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isCollapsed) {
      dispatch(toggleCollapse());
    }
  }, [isMobile, isCollapsed, dispatch]);

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : "expanded"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div className="side-bar-header">
        <PiSmileyMeltingFill className="logo-icon" />
        {!isCollapsed && <h3>GLEAM</h3>}
      </div>

      {/* Sidebar Items */}
      <div className="sidebar-main-item">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${
                activeItem === item.id ? "active-sidebar" : ""
              }`}
              onClick={() => dispatch(setActiveItem(item.id))}
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
