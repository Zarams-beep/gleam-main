import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RiHomeSmileLine, RiTeamFill } from "react-icons/ri";
import { LuMessageCircleHeart } from "react-icons/lu";
import { FaAward, FaPaperPlane, FaInbox } from "react-icons/fa";
import { MdCookie, MdLeaderboard, MdAdminPanelSettings } from "react-icons/md";
import { FiSettings, FiUser } from "react-icons/fi";
import { IconType } from "react-icons";

export type SidebarItem = {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  adminOnly?: boolean;
};

interface SidebarState {
  isCollapsed: boolean;
  items: SidebarItem[];
  activeItem: string | null;
}

export const initialState: SidebarState = {
  isCollapsed: true,
  activeItem: "home",
  items: [
    { id: "home",        label: "Home",        icon: RiHomeSmileLine,      path: "/dashboard" },
    { id: "send",        label: "Send",        icon: FaPaperPlane,         path: "/dashboard/send" },
    { id: "inbox",       label: "Inbox",       icon: FaInbox,              path: "/dashboard/inbox" },
    { id: "leaderboard", label: "Leaderboard", icon: MdLeaderboard,        path: "/dashboard/leaderboard" },
    { id: "team",        label: "Team",        icon: RiTeamFill,           path: "/dashboard/team" },
    { id: "fortune",     label: "Fortune",     icon: MdCookie,             path: "/dashboard/fortune" },
    { id: "awards",      label: "Awards",      icon: FaAward,              path: "/dashboard/awards" },
    { id: "message",     label: "Message",     icon: LuMessageCircleHeart,    path: "/dashboard/message" },
    { id: "admin",       label: "Admin Panel",  icon: MdAdminPanelSettings,   path: "/dashboard/admin", adminOnly: true },
    { id: "profile",     label: "Profile",      icon: FiUser,                 path: "/dashboard/profile" },
    { id: "settings",    label: "Settings",     icon: FiSettings,             path: "/dashboard/settings" },
  ],
};

const sideBarSlices = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleCollapse: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    setActiveItem: (state, action: PayloadAction<string>) => {
      state.activeItem = action.payload;
    },
  },
});

export const { toggleCollapse, setActiveItem } = sideBarSlices.actions;
export default sideBarSlices.reducer;
