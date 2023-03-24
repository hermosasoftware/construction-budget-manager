import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectExtraBudget } from '../../types/projectExtraBudget';

interface projectExtraBudgetState {
  projectExtraBudget: IProjectExtraBudget | null;
}

const initialState: projectExtraBudgetState = {
  projectExtraBudget: null,
};

export const projectExtraBudgetSlice = createSlice({
  name: 'projectExtraBudget',
  initialState,
  reducers: {
    changeProjectExtraBudget: (
      state,
      { payload }: PayloadAction<IProjectExtraBudget>,
    ) => {
      state.projectExtraBudget = payload;
    },
    clearProjectExtraBudget: state => {
      state.projectExtraBudget = null;
    },
  },
});

export const { changeProjectExtraBudget, clearProjectExtraBudget } =
  projectExtraBudgetSlice.actions;

export default projectExtraBudgetSlice.reducer;
