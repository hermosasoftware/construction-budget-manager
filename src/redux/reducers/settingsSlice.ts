import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TAppLang, TObject } from '../../types/global';

interface ISettingsState {
  appLang: TAppLang;
  appStrings: TObject;
}

const initialState: ISettingsState = {
  appLang: 'en',
  appStrings: {},
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
  },
});

export const { changeAppLang, changeAppStrings } = settingsSlice.actions;

export default settingsSlice.reducer;
