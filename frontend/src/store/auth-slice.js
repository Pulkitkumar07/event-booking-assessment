import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.loading = false;
    },
    clearUser(state) {
      state.user = null;
      state.loading = false;
    },
    finishSessionCheck(state) {
      state.loading = false;
    }
  }
});

export const { clearUser, finishSessionCheck, setUser } = authSlice.actions;
export default authSlice.reducer;
