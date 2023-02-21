import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMaterial, IMaterialBreakdown } from '../../types/collections';

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
  },
});

export const { changeMaterials } = materialsSlice.actions;

export default materialsSlice.reducer;
