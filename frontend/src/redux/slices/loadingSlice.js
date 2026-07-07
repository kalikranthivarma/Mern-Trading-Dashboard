import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  global: false,
  actions: {}
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading(state, action) {
      const { key, value } = action.payload;
      state.actions[key] = value;
      state.global = Object.values(state.actions).some(Boolean);
    }
  }
});

export const { setLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
