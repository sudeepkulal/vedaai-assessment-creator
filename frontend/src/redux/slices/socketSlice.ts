import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SocketState {
  connected: boolean;
  progress: number;
}

const initialState: SocketState = {
  connected: false,
  progress: 0,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    resetProgress(state) {
      state.progress = 0;
    },
  },
});

export const {
  setConnectionStatus,
  setProgress,
  resetProgress,
} = socketSlice.actions;

export default socketSlice.reducer;
