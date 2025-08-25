// store/sidebarSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RiHomeSmileLine, RiTeamFill } from "react-icons/ri";
import { LuMessageCircleHeart } from "react-icons/lu";
import { FaAward } from "react-icons/fa";
import { MdCookie } from "react-icons/md";
import { IconType } from "react-icons";
export type SidebarItem = {
  id: string;
  label: string;
  icon: IconType; 
  path?: string;
};

interface SidebarState {
  isCollapsed: boolean;
  items: SidebarItem[];
  activeItem: string | null;
}

const initialState: SidebarState = {
  isCollapsed: true,
  activeItem: "home",
  items: [
    { id: "home", label: "Home", icon: RiHomeSmileLine, path: "/dashboard" },
    { id: "message", label: "Message", icon: LuMessageCircleHeart, path: "/dashboard/messages" },
    { id: "award", label: "Award", icon: FaAward, path: "/dashboard/awards" },
    { id: "team", label: "Team", icon: RiTeamFill, path: "/dashboard/team" },
    { id: "fortune", label: "Fortune", icon: MdCookie, path: "/dashboard/fortune" },
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
