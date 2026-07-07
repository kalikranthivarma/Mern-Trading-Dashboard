import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  modal: null,
  toast: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setModal(state, action) {
      state.modal = action.payload;
    }
  }
});

export const { toggleSidebar, setModal } = uiSlice.actions;
export default uiSlice.reducer;
