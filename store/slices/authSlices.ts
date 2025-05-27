import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  fullName: string;
  image: string | null; // New: Store user image
  email:string;
  token:string;
  id:string;
}

const initialState: AuthState = {
  fullName: "",
  image: null,
  email:"",
  token:"",
  id:""
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{ fullName: string; image: string | null; email: string; token:string; id:string;
    }>) => {
      state.fullName = action.payload.fullName;
      state.image = action.payload.image;
      state.email=action.payload.email;
      state.token=action.payload.token;
      state.id=action.payload.id;
    },
  },
});

export const { setUserData } = authSlice.actions;
export default authSlice.reducer;
