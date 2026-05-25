import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Assignment } from './assignmentSlice';

interface GenerationState {
  loading: boolean;
  generatedPaper: Assignment | null;
  generationStatus: 'idle' | 'generating' | 'completed' | 'failed';
  errors: string | null;
}

const initialState: GenerationState = {
  loading: false,
  generatedPaper: null,
  generationStatus: 'idle',
  errors: null,
};

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    startGeneration(state) {
      state.loading = true;
      state.generationStatus = 'generating';
      state.errors = null;
    },
    generationSuccess(state, action: PayloadAction<Assignment>) {
      state.loading = false;
      state.generatedPaper = action.payload;
      state.generationStatus = 'completed';
      state.errors = null;
    },
    generationFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.generatedPaper = null;
      state.generationStatus = 'failed';
      state.errors = action.payload;
    },
    resetGeneration(state) {
      state.loading = false;
      state.generatedPaper = null;
      state.generationStatus = 'idle';
      state.errors = null;
    },
  },
});

export const {
  startGeneration,
  generationSuccess,
  generationFailure,
  resetGeneration,
} = generationSlice.actions;

export default generationSlice.reducer;
