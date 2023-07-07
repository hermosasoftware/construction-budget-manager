import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetOther } from '../../types/budgetOther';

interface budgetOthersState {
  budgetOthers: IBudgetOther[] | [];
}

const initialState: budgetOthersState = {
  budgetOthers: [],
};

export const budgetOthersSlice = createSlice({
  name: 'budgetOthers',
  initialState,
  reducers: {
    changeBudgetOthers: (state, { payload }: PayloadAction<IBudgetOther[]>) => {
      state.budgetOthers = payload;
    },
    insertBudgetOther: (state, { payload }: PayloadAction<IBudgetOther>) => {
      state.budgetOthers = [...state.budgetOthers, payload];
    },
    modifyBudgetOther: (state, { payload }: PayloadAction<IBudgetOther>) => {
      const index = state.budgetOthers.findIndex(m => m.id === payload.id);
      const newArray = [...state.budgetOthers];
      newArray[index] = payload;
      return {
        ...state,
        budgetOthers: newArray,
      };
    },
    removeBudgetOther: (state, { payload }: PayloadAction<IBudgetOther>) => {
      state.budgetOthers = state.budgetOthers.filter(m => m.id !== payload.id);
    },
  },
});

export const {
  changeBudgetOthers,
  insertBudgetOther,
  modifyBudgetOther,
  removeBudgetOther,
} = budgetOthersSlice.actions;

export default budgetOthersSlice.reducer;
