import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unread: 0,
  status: 'idle'
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.notifications = action.payload.notifications;
      state.unread = action.payload.unread;
      state.status = 'succeeded';
    }
  }
});

export const { setNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
