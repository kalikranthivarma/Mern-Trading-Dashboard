import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  positions: [],
  allocation: {},
  metrics: {},
  status: 'idle'
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolio(state, action) {
      state.positions = action.payload.positions;
      state.allocation = action.payload.allocation;
      state.metrics = action.payload.metrics;
      state.status = 'succeeded';
    }
  }
});

export const { setPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
