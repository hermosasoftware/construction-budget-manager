import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectInvoiceDetail } from '../../types/projectInvoiceDetail';

interface projectInvoicesState {
  projectInvoices: IProjectInvoiceDetail[] | [];
}

const initialState: projectInvoicesState = {
  projectInvoices: [],
};

export const projectInvoicesSlice = createSlice({
  name: 'projectInvoices',
  initialState,
  reducers: {
    changeProjectInvoices: (
      state,
      { payload }: PayloadAction<IProjectInvoiceDetail[]>,
    ) => {
      state.projectInvoices = payload;
    },
    insertProjectInvoice: (
      state,
      { payload }: PayloadAction<IProjectInvoiceDetail>,
    ) => {
      state.projectInvoices = [payload, ...state.projectInvoices];
    },
    modifyProjectInvoice: (
      state,
      { payload }: PayloadAction<IProjectInvoiceDetail>,
    ) => {
      const index = state.projectInvoices.findIndex(m => m.id === payload.id);
      const newArray = [...state.projectInvoices];
      newArray[index] = payload;
      return {
        ...state,
        projectInvoices: newArray,
      };
    },
    removeProjectInvoice: (
      state,
      { payload }: PayloadAction<IProjectInvoiceDetail>,
    ) => {
      state.projectInvoices = state.projectInvoices.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeProjectInvoices,
  insertProjectInvoice,
  modifyProjectInvoice,
  removeProjectInvoice,
} = projectInvoicesSlice.actions;

export default projectInvoicesSlice.reducer;
