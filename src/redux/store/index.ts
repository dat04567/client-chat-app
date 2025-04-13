import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../services/apiSlice';
import { emailVerificationSlice } from '../features/email/emailVerificationSlice';

export const store = configureStore({
  reducer: {
    emailVerification: emailVerificationSlice.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in Redux state
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;