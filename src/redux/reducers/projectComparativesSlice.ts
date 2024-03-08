import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectComparative } from '../../types/projectComparative';

interface projectComparativesState {
  projectComparatives: IProjectComparative[] | [];
}

const initialState: projectComparativesState = {
  projectComparatives: [],
};

export const projectComparativesSlice = createSlice({
  name: 'projectComparatives',
  initialState,
  reducers: {
    changeProjectComparatives: (
      state,
      { payload }: PayloadAction<IProjectComparative[]>,
    ) => {
      state.projectComparatives = payload;
    },
    insertProjectComparative: (
      state,
      { payload }: PayloadAction<IProjectComparative>,
    ) => {
      state.projectComparatives = [...state.projectComparatives, payload];
    },
    modifyProjectComparative: (
      state,
      { payload }: PayloadAction<IProjectComparative>,
    ) => {
      const index = state.projectComparatives.findIndex(
        m => m.id === payload.id,
      );
      const newArray = [...state.projectComparatives];
      newArray[index] = payload;
      return {
        ...state,
        projectComparative: newArray,
      };
    },
    removeProjectComparative: (
      state,
      { payload }: PayloadAction<IProjectComparative>,
    ) => {
      state.projectComparatives = state.projectComparatives.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeProjectComparatives,
  insertProjectComparative,
  modifyProjectComparative,
  removeProjectComparative,
} = projectComparativesSlice.actions;

export default projectComparativesSlice.reducer;
