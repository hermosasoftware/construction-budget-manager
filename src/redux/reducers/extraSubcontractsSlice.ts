import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetSubcontract } from '../../types/budgetSubcontract';

interface extraSubcontractsState {
  extraSubcontracts: IBudgetSubcontract[] | [];
}

const initialState: extraSubcontractsState = {
  extraSubcontracts: [],
};

export const extraSubcontractsSlice = createSlice({
  name: 'extraSubcontracts',
  initialState,
  reducers: {
    changeExtraSubcontracts: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract[]>,
    ) => {
      state.extraSubcontracts = payload;
    },
    insertExtraSubcontract: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract>,
    ) => {
      state.extraSubcontracts = [payload, ...state.extraSubcontracts];
    },
    modifyExtraSubcontract: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract>,
    ) => {
      const index = state.extraSubcontracts.findIndex(m => m.id === payload.id);
      const newArray = [...state.extraSubcontracts];
      newArray[index] = payload;
      return {
        ...state,
        extraSubcontracts: newArray,
      };
    },
    removeExtraSubcontract: (
      state,
      { payload }: PayloadAction<IBudgetSubcontract>,
    ) => {
      state.extraSubcontracts = state.extraSubcontracts.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeExtraSubcontracts,
  insertExtraSubcontract,
  modifyExtraSubcontract,
  removeExtraSubcontract,
} = extraSubcontractsSlice.actions;

export default extraSubcontractsSlice.reducer;
