import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetSubcontract } from '../../types/budgetSubcontract';

interface budgetSubcontractsState {
  budgetSubcontracts: IBudgetSubcontract[] | [];
}

const initialState: budgetSubcontractsState = {
  budgetSubcontracts: [],
};

export const budgetSubcontractsSlice = createSlice({
  name: 'budgetSubcontracts',
  initialState,
  reducers: {
    changeBudgetSubcontracts: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract[]>,
    ) => {
      state.budgetSubcontracts = payload;
    },
    insertBudgetSubcontract: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract>,
    ) => {
      state.budgetSubcontracts = [...state.budgetSubcontracts, payload];
    },
    modifyBudgetSubcontract: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract>,
    ) => {
      const index = state.budgetSubcontracts.findIndex(
        m => m.id === payload.id,
      );
      const newArray = [...state.budgetSubcontracts];
      newArray[index] = payload;
      return {
        ...state,
        budgetSubcontracts: newArray,
      };
    },
    removeBudgetSubcontract: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract>,
    ) => {
      state.budgetSubcontracts = state.budgetSubcontracts.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeBudgetSubcontracts,
  insertBudgetSubcontract,
  modifyBudgetSubcontract,
  removeBudgetSubcontract,
} = budgetSubcontractsSlice.actions;

export default budgetSubcontractsSlice.reducer;
