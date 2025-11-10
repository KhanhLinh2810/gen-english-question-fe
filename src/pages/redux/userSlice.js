// src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setAvatar: (state, action) => {
      if (state.currentUser) {
        state.currentUser.avatar = action.payload;
      }
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setUser, setAvatar, logout } = userSlice.actions;
export default userSlice.reducer;
