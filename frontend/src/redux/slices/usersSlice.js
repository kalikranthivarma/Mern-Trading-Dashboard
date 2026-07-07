import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  selected: null,
  status: 'idle'
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers(state, action) {
      state.list = action.payload;
      state.status = 'succeeded';
    },
    selectUser(state, action) {
      state.selected = action.payload;
    }
  }
});

export const { setUsers, selectUser } = usersSlice.actions;
export default usersSlice.reducer;
