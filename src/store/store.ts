import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import settingsReducer from './reducers/settings';
import cacheReducer from './reducers/cache';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    cache: cacheReducer,
  },
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
