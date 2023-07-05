import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TAppLang, TObject } from '../../types/global';

interface ISettingsState {
  appLang: TAppLang;
  appStrings: TObject;
  itemsPerPage: number;
}

const initialState: ISettingsState = {
  appLang: 'en',
  appStrings: {},
  itemsPerPage: 10,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    changeAppLang: (state, { payload }: PayloadAction<TAppLang>) => {
      state.appLang = payload;
    },
    changeAppStrings: (state, { payload }: PayloadAction<TObject>) => {
      state.appStrings = payload;
    },
    changeItemsPerPage: (state, { payload }: PayloadAction<number>) => {
      state.itemsPerPage = payload;
    },
  },
});

export const { changeAppLang, changeAppStrings, changeItemsPerPage } =
  settingsSlice.actions;

export default settingsSlice.reducer;
