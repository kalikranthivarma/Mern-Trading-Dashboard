import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  positions: [],
  marketBook: [],
  status: 'idle'
};

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setTradingData(state, action) {
      state.orders = action.payload.orders;
      state.positions = action.payload.positions;
      state.marketBook = action.payload.marketBook;
      state.status = 'succeeded';
    }
  }
});

export const { setTradingData } = tradingSlice.actions;
export default tradingSlice.reducer;
