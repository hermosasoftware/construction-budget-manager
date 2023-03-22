import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMaterialBreakdown } from '../../types/collections';

interface materialsState {
  materials: IMaterialBreakdown[] | [];
}

const initialState: materialsState = {
  materials: [],
};

export const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    changeMaterials: (
      state,
      { payload }: PayloadAction<IMaterialBreakdown[]>,
    ) => {
      state.materials = payload;
    },
    insertMaterial: (state, { payload }: PayloadAction<IMaterialBreakdown>) => {
      state.materials = [payload, ...state.materials];
    },
    modifyMaterial: (state, { payload }: PayloadAction<IMaterialBreakdown>) => {
      const index = state.materials.findIndex(m => m.id === payload.id);
      const newArray = [...state.materials];
      newArray[index] = payload;
      return {
        ...state,
        materials: newArray,
      };
    },
    removeMaterial: (state, { payload }: PayloadAction<IMaterialBreakdown>) => {
      state.materials = state.materials.filter(m => m.id !== payload.id);
    },
  },
});

export const {
  changeMaterials,
  insertMaterial,
  modifyMaterial,
  removeMaterial,
} = materialsSlice.actions;

export default materialsSlice.reducer;
