import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Organization } from "@/types/auth";

interface OrgState {
  org: Organization | null;
  hasFetched: boolean;
}

const initialState: OrgState = {
  org: null,
  hasFetched: false,
};

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    setOrg: (state, action: PayloadAction<Organization>) => {
      state.org = action.payload;
      state.hasFetched = true;
    },
    clearOrg: (state) => {
      state.org = null;
      state.hasFetched = false;
    },
  },
});

export const { setOrg, clearOrg } = orgSlice.actions;
export default orgSlice.reducer;
