"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setActiveItem, toggleCollapse } from "@/store/slices/sidebarSlices_";
import { useCallback, useEffect, useState } from "react";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { useRouter } from "next/navigation"; // ✅ import router
import "@/styles/Dashboard.css";

export default function DashboardSidebar() {
  const { items, isCollapsed, activeItem } = useSelector(
    (state: RootState) => state.sidebar
  );
  const dispatch = useDispatch();
  const router = useRouter(); // ✅ initialize router

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 600);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && isCollapsed) {
      dispatch(toggleCollapse());
    }
  }, [isMobile, isCollapsed, dispatch]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isCollapsed) {
      dispatch(toggleCollapse());
    }
  }, [isMobile, isCollapsed, dispatch]);

  const handleItemClick = (item: any) => {
    dispatch(setActiveItem(item.id));
    if (item.path) router.push(item.path); // ✅ navigate to page
  };

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
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${
                activeItem === item.id ? "active-sidebar" : ""
              }`}
              onClick={() => handleItemClick(item)} 
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
