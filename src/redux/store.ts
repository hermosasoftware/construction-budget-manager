import { configureStore } from '@reduxjs/toolkit';

import settings from './reducers/settingsSlice';
import session from './reducers/sessionSlice';
import modals from './reducers/modalsSlice';
import materials from './reducers/materialsSlice';

import logger from 'redux-logger';

export const store = configureStore({
  reducer: {
    settings,
    session,
    modals,
    materials,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
