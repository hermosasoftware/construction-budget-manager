import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProject } from '../../types/project';

interface projectsState {
  projects: IProject[] | [];
}

const initialState: projectsState = {
  projects: [],
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    changeProjects: (state, { payload }: PayloadAction<IProject[]>) => {
      state.projects = payload;
    },
    insertProject: (state, { payload }: PayloadAction<IProject>) => {
      state.projects = [payload, ...state.projects];
    },
    modifyProject: (state, { payload }: PayloadAction<IProject>) => {
      const index = state.projects.findIndex(m => m.id === payload.id);
      const newArray = [...state.projects];
      newArray[index] = payload;
      return {
        ...state,
        projects: newArray,
      };
    },
    removeProject: (state, { payload }: PayloadAction<IProject>) => {
      state.projects = state.projects.filter(m => m.id !== payload.id);
    },
  },
});

export const { changeProjects, insertProject, modifyProject, removeProject } =
  projectsSlice.actions;

export default projectsSlice.reducer;
