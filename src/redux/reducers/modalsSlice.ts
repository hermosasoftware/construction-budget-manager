import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TObject } from '../../types/global';

type TModalData = {
  isOpen: boolean;
  initialData?: TObject;
};

interface IModalsState {
  playgroundModal: TModalData;
}

const initialState: IModalsState = {
  playgroundModal: {
    isOpen: false,
  },
};

export type TModalName = keyof IModalsState;

type reducerPayload = PayloadAction<{
  modalName: TModalName;
  newState: TModalData;
}>;

export const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    changeModalState: (state, { payload }: reducerPayload) => {
      const { modalName, newState } = payload;
      state[modalName] = newState;
    },
  },
});

export const { changeModalState } = modalsSlice.actions;

export default modalsSlice.reducer;
