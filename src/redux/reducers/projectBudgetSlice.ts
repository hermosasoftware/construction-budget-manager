import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectBudget } from '../../types/projectBudget';

interface projectBudgetState {
  projectBudget: IProjectBudget | undefined;
}

const initialState: projectBudgetState = {
  projectBudget: undefined,
};

export const projectBudgetSlice = createSlice({
  name: 'projectBudget',
  initialState,
  reducers: {
    changeProjectBudget: (
      state,
      { payload }: PayloadAction<IProjectBudget>,
    ) => {
      state.projectBudget = payload;
    },
    clearProjectBudget: state => {
      state.projectBudget = undefined;
    },
  },
});

export const { changeProjectBudget, clearProjectBudget } =
  projectBudgetSlice.actions;

export default projectBudgetSlice.reducer;
