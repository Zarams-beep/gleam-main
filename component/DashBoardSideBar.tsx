"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setActiveItem, toggleCollapse } from "@/store/slices/sidebarSlices_";
import { useCallback } from "react";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { motion } from "framer-motion";
import "@/styles/Dashboard.css";
export default function DashboardSidebar() {
  const { items, isCollapsed, activeItem } = useSelector(
    (state: RootState) => state.sidebar
  );
  const dispatch = useDispatch();

  // Expand on hover
  const handleMouseEnter = useCallback(() => {
    if (isCollapsed) {
      dispatch(toggleCollapse());
    }
  }, [isCollapsed, dispatch]);

  // Collapse when leaving
  const handleMouseLeave = useCallback(() => {
    if (!isCollapsed) {
      dispatch(toggleCollapse());
    }
  }, [isCollapsed, dispatch]);

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : "expanded"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
       {/* Logo */}
          <div className="side-bar-header"
          >
            <PiSmileyMeltingFill className="logo-icon" />
            {!isCollapsed && <h3>GLEAM</h3>}
          </div>
      <div className="sidebar-main-item">
        {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? "active-sidebar" : ""}`}
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
