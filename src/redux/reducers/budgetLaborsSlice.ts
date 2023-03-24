import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetLabor } from '../../types/budgetLabor';

interface budgetLaborsState {
  budgetLabors: IBudgetLabor[] | [];
}

const initialState: budgetLaborsState = {
  budgetLabors: [],
};

export const budgetLaborsSlice = createSlice({
  name: 'budgetLabors',
  initialState,
  reducers: {
    changeBudgetLabors: (state, { payload }: PayloadAction<IBudgetLabor[]>) => {
      state.budgetLabors = payload;
    },
    insertBudgetLabor: (state, { payload }: PayloadAction<IBudgetLabor>) => {
      state.budgetLabors = [payload, ...state.budgetLabors];
    },
    modifyBudgetLabor: (state, { payload }: PayloadAction<IBudgetLabor>) => {
      const index = state.budgetLabors.findIndex(m => m.id === payload.id);
      const newArray = [...state.budgetLabors];
      newArray[index] = payload;
      return {
        ...state,
        budgetLabors: newArray,
      };
    },
    removeBudgetLabor: (state, { payload }: PayloadAction<IBudgetLabor>) => {
      state.budgetLabors = state.budgetLabors.filter(m => m.id !== payload.id);
    },
  },
});

export const {
  changeBudgetLabors,
  insertBudgetLabor,
  modifyBudgetLabor,
  removeBudgetLabor,
} = budgetLaborsSlice.actions;

export default budgetLaborsSlice.reducer;
