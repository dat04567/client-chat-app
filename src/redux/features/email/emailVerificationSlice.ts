import { createSlice } from '@reduxjs/toolkit';

// Slice cho việc đếm ngược và trạng thái UI cho xác thực email
export const emailVerificationSlice = createSlice({
  name: 'emailVerification',
  initialState: {
    countdown: 10,
  },
  reducers: {
    decrementCountdown: (state) => {
      if (state.countdown > 0) {
        state.countdown -= 1;
      }
    },
    resetCountdown: (state) => {
      state.countdown = 300;
    },
  },
});

export const { decrementCountdown, resetCountdown } = emailVerificationSlice.actions;

export default emailVerificationSlice.reducer;