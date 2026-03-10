// store/slices/authSlices.ts
// ─── Only holds non-sensitive multi-step signup form state ───────────────────
// Passwords are NEVER stored here. react-hook-form manages them locally.
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  fullName: string;
  image: string | null;
  email: string;
}

const initialState: AuthState = {
  fullName: "",
  image: null,
  email: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (
      state,
      action: PayloadAction<{ fullName: string; image: string | null; email: string }>
    ) => {
      state.fullName = action.payload.fullName;
      state.image = action.payload.image;
      state.email = action.payload.email;
    },
    clearUserData: (state) => {
      state.fullName = "";
      state.image = null;
      state.email = "";
    },
  },
});

export const { setUserData, clearUserData } = authSlice.actions;
export default authSlice.reducer;
