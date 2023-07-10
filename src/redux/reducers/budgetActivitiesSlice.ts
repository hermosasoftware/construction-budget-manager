import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetActivity } from '../../types/budgetActivity';

interface budgetActivitiesState {
  budgetActivities: IBudgetActivity[] | [];
}

const initialState: budgetActivitiesState = {
  budgetActivities: [],
};

export const budgetActivitiesSlice = createSlice({
  name: 'budgetActivities',
  initialState,
  reducers: {
    changeBudgetActivities: (
      state,
      { payload }: PayloadAction<IBudgetActivity[]>,
    ) => {
      state.budgetActivities = payload;
    },
    insertBudgetActivity: (
      state,
      { payload }: PayloadAction<IBudgetActivity>,
    ) => {
      state.budgetActivities = [...state.budgetActivities, payload];
    },
    modifyBudgetActivity: (
      state,
      { payload }: PayloadAction<IBudgetActivity>,
    ) => {
      const index = state.budgetActivities.findIndex(m => m.id === payload.id);
      const newArray = [...state.budgetActivities];
      newArray[index] = payload;
      return {
        ...state,
        budgetActivities: newArray,
      };
    },
    removeBudgetActivity: (
      state,
      { payload }: PayloadAction<IBudgetActivity>,
    ) => {
      state.budgetActivities = state.budgetActivities.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeBudgetActivities,
  insertBudgetActivity,
  modifyBudgetActivity,
  removeBudgetActivity,
} = budgetActivitiesSlice.actions;

export default budgetActivitiesSlice.reducer;
