// store/slices/userSlice.ts
// ─── Single source of truth for auth. redux-persist handles storage. ─────────
// Manual localStorage writes removed — they created two sources of truth
// that could drift out of sync with persisted Redux state.
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GleamUser } from "@/types/auth";

interface UserState {
  user: GleamUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: GleamUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<GleamUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateUser, clearCredentials } = userSlice.actions;
export default userSlice.reducer;
