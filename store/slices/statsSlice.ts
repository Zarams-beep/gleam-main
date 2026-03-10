import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserStats } from "@/types/auth";

interface StatsState {
  stats: UserStats | null;
  lastFetched: number | null;
}

const initialState: StatsState = {
  stats: null,
  lastFetched: null,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<UserStats>) => {
      state.stats = action.payload;
      state.lastFetched = Date.now();
    },
    clearStats: (state) => {
      state.stats = null;
      state.lastFetched = null;
    },
  },
});

export const { setStats, clearStats } = statsSlice.actions;
export default statsSlice.reducer;
