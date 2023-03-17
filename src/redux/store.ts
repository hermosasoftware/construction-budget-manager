import { configureStore } from '@reduxjs/toolkit';

import settings from './reducers/settingsSlice';
import session from './reducers/sessionSlice';
import modals from './reducers/modalsSlice';
import materials from './reducers/materialsSlice';
import projects from './reducers/projectsSlice';
import projectExpenses from './reducers/projectExpensesSlice';
import projectInvoices from './reducers/projectInvoicesSlice';
import projectOrders from './reducers/projectOrdersSlice';

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
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
