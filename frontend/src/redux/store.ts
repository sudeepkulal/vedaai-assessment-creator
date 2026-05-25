import { configureStore } from '@reduxjs/toolkit';
import assignmentReducer from './slices/assignmentSlice';
import generationReducer from './slices/generationSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    assignment: assignmentReducer,
    generation: generationReducer,
    socket: socketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
