import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../types/user';

interface sessionState {
  user: IUser | null;
  userAPI: any;
}

const initialState: sessionState = {
  user: null,
  userAPI: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    changeUser: (state, { payload }: PayloadAction<IUser>) => {
      state.user = payload;
    },
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: state => {
      state.user = null;
    },
  },
});

export const { changeUser, login, logout } = sessionSlice.actions;

export default sessionSlice.reducer;
