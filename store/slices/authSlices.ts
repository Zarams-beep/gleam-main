import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  fullName: string;
  image: string | null; // New: Store user image
  email:string;
  password:string;
  confirmPassword:string;
}

const initialState: AuthState = {
  fullName: "",
  image: null,
  email:"",
  password:"",
  confirmPassword:"",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{ fullName: string; image: string | null; email: string; password:string; confirmPassword:string;
    }>) => {
      state.fullName = action.payload.fullName;
      state.image = action.payload.image;
      state.email=action.payload.email;
      state.password=action.payload.password;
      state.confirmPassword=action.payload.confirmPassword
    },
  },
});

export const { setUserData } = authSlice.actions;
export default authSlice.reducer;
