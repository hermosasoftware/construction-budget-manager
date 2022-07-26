import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../types/user';

interface sessionState {
  user: IUser | null;
}

const initialState: sessionState = {
  user: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    changeUser: (state, { payload }: PayloadAction<IUser>) => {
      state.user = payload;
    },
  },
});

export const { changeUser } = sessionSlice.actions;

export default sessionSlice.reducer;
