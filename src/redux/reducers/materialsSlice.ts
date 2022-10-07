import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMaterial } from '../../types/collections';

interface materialsState {
  materials: IMaterial[] | [];
}

const initialState: materialsState = {
  materials: [],
};

export const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    changeMaterials: (state, { payload }: PayloadAction<IMaterial[]>) => {
      state.materials = payload;
    },
  },
});

export const { changeMaterials } = materialsSlice.actions;

export default materialsSlice.reducer;
