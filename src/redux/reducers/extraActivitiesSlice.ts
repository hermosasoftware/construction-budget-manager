import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBudgetActivity } from '../../types/budgetActivity';

interface extraActivitiesState {
  extraActivities: IBudgetActivity[] | [];
}

const initialState: extraActivitiesState = {
  extraActivities: [],
};

export const extraActivitiesSlice = createSlice({
  name: 'extraActivities',
  initialState,
  reducers: {
    changeExtraActivities: (
      state,
      { payload }: PayloadAction<IBudgetActivity[]>,
    ) => {
      state.extraActivities = payload;
    },
    insertExtraActivity: (
      state,
      { payload }: PayloadAction<IBudgetActivity>,
    ) => {
      state.extraActivities = [...state.extraActivities, payload];
    },
    modifyExtraActivity: (
      state,
      { payload }: PayloadAction<IBudgetActivity>,
    ) => {
      const index = state.extraActivities.findIndex(m => m.id === payload.id);
      const newArray = [...state.extraActivities];
      newArray[index] = payload;
      return {
        ...state,
        extraActivities: newArray,
      };
    },
    removeExtraActivity: (
      state,
      { payload }: PayloadAction<IBudgetActivity>,
    ) => {
      state.extraActivities = state.extraActivities.filter(
        m => m.id !== payload.id,
      );
    },
  },
});

export const {
  changeExtraActivities,
  insertExtraActivity,
  modifyExtraActivity,
  removeExtraActivity,
} = extraActivitiesSlice.actions;

export default extraActivitiesSlice.reducer;
