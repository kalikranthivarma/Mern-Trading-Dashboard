import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  preferences: {
    theme: 'dark',
    notifications: true
  },
  status: 'idle'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings(state, action) {
      state.preferences = { ...state.preferences, ...action.payload };
      state.status = 'succeeded';
    }
  }
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
