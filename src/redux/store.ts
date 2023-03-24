import { configureStore } from '@reduxjs/toolkit';

import settings from './reducers/settingsSlice';
import session from './reducers/sessionSlice';
import modals from './reducers/modalsSlice';
import materials from './reducers/materialsSlice';
import projects from './reducers/projectsSlice';
import projectExpenses from './reducers/projectExpensesSlice';
import projectInvoices from './reducers/projectInvoicesSlice';
import projectOrders from './reducers/projectOrdersSlice';
import budgetActivities from './reducers/budgetActivitiesSlice';
import budgetLabors from './reducers/budgetLaborsSlice';
import budgetSubcontracts from './reducers/budgetSubcontractsSlice';
import budgetOthers from './reducers/budgetOthersSlice';
import extraActivities from './reducers/extraActivitiesSlice';
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
    projectExpenses,
    projectInvoices,
    projectOrders,
    budgetActivities,
    budgetLabors,
    budgetSubcontracts,
    budgetOthers,
    extraActivities,
    extraLabors,
    extraSubcontracts,
    extraOthers,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
