import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoginAuthState {
  email: string;
  password: string;
  saveDetails?: boolean; // optional property
}

const initialState: LoginAuthState = {
  email: "",
  password: "",
  saveDetails: false, // you can still give it a default
};

const authLoginSlice = createSlice({
  name: "authLogin",
  initialState,
  reducers: {
    setUserLoginData: (
      state,
      action: PayloadAction<{
        email: string;
        password: string;
        saveDetails?: boolean; // also optional in payload
      }>
    ) => {
      state.email = action.payload.email;
      state.password = action.payload.password;
      state.saveDetails = action.payload.saveDetails ?? state.saveDetails;
    },
  },
});

export const { setUserLoginData } = authLoginSlice.actions;
export default authLoginSlice.reducer;
