import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMaterialBreakdown } from '../../types/collections';

interface extraMaterialsState {
  extraMaterials: IMaterialBreakdown[] | [];
}

const initialState: extraMaterialsState = {
  extraMaterials: [],
};

export const extraMaterialsSlice = createSlice({
  name: 'extraMaterials',
  initialState,
  reducers: {
    changeExtraMaterials: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown[]>,
    ) => {
      state.extraMaterials = payload;
    },
    insertExtraMaterial: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown>,
    ) => {
      state.extraMaterials = [...state.extraMaterials, payload];
    },
    modifyExtraMaterial: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown>,
    ) => {
      const index = state.extraMaterials.findIndex(m => m.id === payload.id);
      const newArray = [...state.extraMaterials];
      newArray[index] = payload;
      return {
        ...state,
        extraMaterials: newArray,
      };
    },
    removeExtraMaterial: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown>,
    ) => {
      state.extraMaterials = state.extraMaterials.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeExtraMaterials,
  insertExtraMaterial,
  modifyExtraMaterial,
  removeExtraMaterial,
} = extraMaterialsSlice.actions;

export default extraMaterialsSlice.reducer;
