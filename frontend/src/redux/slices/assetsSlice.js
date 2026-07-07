import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  categories: {},
  selectedAsset: null,
  status: 'idle'
};

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets(state, action) {
      state.list = action.payload.list;
      state.categories = action.payload.categories;
      state.status = 'succeeded';
    },
    selectAsset(state, action) {
      state.selectedAsset = action.payload;
    }
  }
});

export const { setAssets, selectAsset } = assetsSlice.actions;
export default assetsSlice.reducer;
