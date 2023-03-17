import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectOrder } from '../../types/projectOrder';

interface projectOrdersState {
  projectOrders: IProjectOrder[] | [];
}

const initialState: projectOrdersState = {
  projectOrders: [],
};

export const projectOrdersSlice = createSlice({
  name: 'projectOrders',
  initialState,
  reducers: {
    changeProjectOrders: (
      state,
      { payload }: PayloadAction<IProjectOrder[]>,
    ) => {
      state.projectOrders = payload;
    },
    insertProjectOrder: (state, { payload }: PayloadAction<IProjectOrder>) => {
      state.projectOrders = [payload, ...state.projectOrders];
    },
    modifyProjectOrder: (state, { payload }: PayloadAction<IProjectOrder>) => {
      const index = state.projectOrders.findIndex(m => m.id === payload.id);
      const newArray = [...state.projectOrders];
      newArray[index] = payload;
      return {
        ...state,
        projectOrders: newArray,
      };
    },
    removeProjectOrder: (state, { payload }: PayloadAction<IProjectOrder>) => {
      state.projectOrders = state.projectOrders.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeProjectOrders,
  insertProjectOrder,
  modifyProjectOrder,
  removeProjectOrder,
} = projectOrdersSlice.actions;

export default projectOrdersSlice.reducer;
