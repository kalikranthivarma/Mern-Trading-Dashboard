import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  pagination: { page: 1, limit: 20, total: 0 },
  filters: {},
  status: 'idle'
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action) {
      state.list = action.payload.list;
      state.pagination = action.payload.pagination;
      state.status = 'succeeded';
    }
  }
});

export const { setOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
