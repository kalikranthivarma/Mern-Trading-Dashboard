import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reportFiles: [],
  status: 'idle'
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports(state, action) {
      state.reportFiles = action.payload;
      state.status = 'succeeded';
    }
  }
});

export const { setReports } = reportsSlice.actions;
export default reportsSlice.reducer;
