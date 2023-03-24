import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetLabor } from '../../types/budgetLabor';

interface extraLaborsState {
  extraLabors: IBudgetLabor[] | [];
}

const initialState: extraLaborsState = {
  extraLabors: [],
};

export const extraLaborsSlice = createSlice({
  name: 'extraLabors',
  initialState,
  reducers: {
    changeExtraLabors: (state, { payload }: PayloadAction<IBudgetLabor[]>) => {
      state.extraLabors = payload;
    },
    insertExtraLabor: (state, { payload }: PayloadAction<IBudgetLabor>) => {
      state.extraLabors = [payload, ...state.extraLabors];
    },
    modifyExtraLabor: (state, { payload }: PayloadAction<IBudgetLabor>) => {
      const index = state.extraLabors.findIndex(m => m.id === payload.id);
      const newArray = [...state.extraLabors];
      newArray[index] = payload;
      return {
        ...state,
        extraLabors: newArray,
      };
    },
    removeExtraLabor: (state, { payload }: PayloadAction<IBudgetLabor>) => {
      state.extraLabors = state.extraLabors.filter(m => m.id !== payload.id);
    },
  },
});

export const {
  changeExtraLabors,
  insertExtraLabor,
  modifyExtraLabor,
  removeExtraLabor,
} = extraLaborsSlice.actions;

export default extraLaborsSlice.reducer;
