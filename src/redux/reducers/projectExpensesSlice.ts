import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectExpense } from '../../types/projectExpense';

interface projectExpensesState {
  projectExpenses: IProjectExpense[] | [];
}

const initialState: projectExpensesState = {
  projectExpenses: [],
};

export const projectExpensesSlice = createSlice({
  name: 'projectExpenses',
  initialState,
  reducers: {
    changeProjectExpenses: (
      state,
      { payload }: PayloadAction<IProjectExpense[]>,
    ) => {
      state.projectExpenses = payload;
    },
    insertProjectExpense: (
      state,
      { payload }: PayloadAction<IProjectExpense>,
    ) => {
      state.projectExpenses = [...state.projectExpenses, payload];
    },
    modifyProjectExpense: (
      state,
      { payload }: PayloadAction<IProjectExpense>,
    ) => {
      const index = state.projectExpenses.findIndex(m => m.id === payload.id);
      const newArray = [...state.projectExpenses];
      newArray[index] = payload;
      return {
        ...state,
        projectExpenses: newArray,
      };
    },
    removeProjectExpense: (
      state,
      { payload }: PayloadAction<IProjectExpense>,
    ) => {
      state.projectExpenses = state.projectExpenses.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeProjectExpenses,
  insertProjectExpense,
  modifyProjectExpense,
  removeProjectExpense,
} = projectExpensesSlice.actions;

export default projectExpensesSlice.reducer;
