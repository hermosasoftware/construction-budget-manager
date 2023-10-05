import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMaterialBreakdown } from '../../types/collections';

interface budgetMaterialsState {
  budgetMaterials: IMaterialBreakdown[] | [];
}

const initialState: budgetMaterialsState = {
  budgetMaterials: [],
};

export const budgetMaterialsSlice = createSlice({
  name: 'budgetMaterials',
  initialState,
  reducers: {
    changeBudgetMaterials: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown[]>,
    ) => {
      state.budgetMaterials = payload;
    },
    insertBudgetMaterial: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown>,
    ) => {
      state.budgetMaterials = [...state.budgetMaterials, payload];
    },
    modifyBudgetMaterial: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown>,
    ) => {
      const index = state.budgetMaterials.findIndex(m => m.id === payload.id);
      const newArray = [...state.budgetMaterials];
      newArray[index] = payload;
      return {
        ...state,
        budgetMaterials: newArray,
      };
    },
    removeBudgetMaterial: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown>,
    ) => {
      state.budgetMaterials = state.budgetMaterials.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeBudgetMaterials,
  insertBudgetMaterial,
  modifyBudgetMaterial,
  removeBudgetMaterial,
} = budgetMaterialsSlice.actions;

export default budgetMaterialsSlice.reducer;
