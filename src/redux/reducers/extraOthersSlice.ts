import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetOther } from '../../types/budgetOther';

interface extraOthersState {
  extraOthers: IBudgetOther[] | [];
}

const initialState: extraOthersState = {
  extraOthers: [],
};

export const extraOthersSlice = createSlice({
  name: 'extraOthers',
  initialState,
  reducers: {
    changeExtraOthers: (state, { payload }: PayloadAction<IBudgetOther[]>) => {
      state.extraOthers = payload;
    },
    insertExtraOther: (state, { payload }: PayloadAction<IBudgetOther>) => {
      state.extraOthers = [payload, ...state.extraOthers];
    },
    modifyExtraOther: (state, { payload }: PayloadAction<IBudgetOther>) => {
      const index = state.extraOthers.findIndex(m => m.id === payload.id);
      const newArray = [...state.extraOthers];
      newArray[index] = payload;
      return {
        ...state,
        extraOthers: newArray,
      };
    },
    removeExtraOther: (state, { payload }: PayloadAction<IBudgetOther>) => {
      state.extraOthers = state.extraOthers.filter(m => m.id !== payload.id);
    },
  },
});

export const {
  changeExtraOthers,
  insertExtraOther,
  modifyExtraOther,
  removeExtraOther,
} = extraOthersSlice.actions;

export default extraOthersSlice.reducer;
