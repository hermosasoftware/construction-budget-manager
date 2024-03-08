import { configureStore } from '@reduxjs/toolkit';

import settings from './reducers/settingsSlice';
import session from './reducers/sessionSlice';
import modals from './reducers/modalsSlice';
import materials from './reducers/materialsSlice';
import projects from './reducers/projectsSlice';
import projectBudget from './reducers/projectBudgetSlice';
import projectExtraBudget from './reducers/projectExtraBudgetSlice';
import projectComparatives from './reducers/projectComparativesSlice';
import projectExpenses from './reducers/projectExpensesSlice';
import projectInvoices from './reducers/projectInvoicesSlice';
import projectOrders from './reducers/projectOrdersSlice';
import budgetActivities from './reducers/budgetActivitiesSlice';
import budgetMaterials from './reducers/budgetMaterialsSlice';
import budgetLabors from './reducers/budgetLaborsSlice';
import budgetSubcontracts from './reducers/budgetSubcontractsSlice';
import budgetOthers from './reducers/budgetOthersSlice';
import extraActivities from './reducers/extraActivitiesSlice';
import extraMaterials from './reducers/extraMaterialsSlice';
import extraLabors from './reducers/extraLaborsSlice';
import extraSubcontracts from './reducers/extraSubcontractsSlice';
import extraOthers from './reducers/extraOthersSlice';

import logger from 'redux-logger';

export const store = configureStore({
  reducer: {
    settings,
    session,
    modals,
    materials,
    projects,
    projectBudget,
    projectExtraBudget,
    projectComparatives,
    projectExpenses,
    projectInvoices,
    projectOrders,
    budgetActivities,
    budgetMaterials,
    budgetLabors,
    budgetSubcontracts,
    budgetOthers,
    extraActivities,
    extraMaterials,
    extraLabors,
    extraSubcontracts,
    extraOthers,
  },
  middleware: getDefaultMiddleware =>
    process.env.NODE_ENV !== 'production'
      ? getDefaultMiddleware().concat(logger)
      : getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
