import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  metrics: {},
  charts: {},
  status: 'idle'
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboard(state, action) {
      state.metrics = action.payload.metrics;
      state.charts = action.payload.charts;
      state.status = 'succeeded';
    }
  }
});

export const { setDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
