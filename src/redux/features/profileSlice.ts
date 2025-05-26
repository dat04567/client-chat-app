import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getProfileAction, updateProfileAction } from '../../app/actions/profile';

export interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  bio: string;
  avatar: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  country: 'Vietnam',
  bio: '',
  avatar: '/images/avatar/1.jpg',
  isLoading: false,
  error: null,
};

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfileAction();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch profile');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

// Async thunk for updating profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await updateProfileAction(formData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileField: (state, action: PayloadAction<{ field: keyof ProfileState; value: any }>) => {
      const { field, value } = action.payload;
      if (field in state) {
        (state as any)[field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.firstName = action.payload.firstName || '';
        state.lastName = action.payload.lastName || '';
        state.email = action.payload.email || '';
        state.phoneNumber = action.payload.phoneNumber || '';
        state.country = action.payload.country || 'Vietnam';
        state.bio = action.payload.bio || '';
        if (action.payload.avatar) {
          state.avatar = action.payload.avatar;
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update fields if the response includes them
        if (action.payload.firstName) state.firstName = action.payload.firstName;
        if (action.payload.lastName) state.lastName = action.payload.lastName;
        if (action.payload.email) state.email = action.payload.email;
        if (action.payload.phoneNumber) state.phoneNumber = action.payload.phoneNumber;
        if (action.payload.country) state.country = action.payload.country;
        if (action.payload.bio) state.bio = action.payload.bio;
        if (action.payload.avatar) state.avatar = action.payload.avatar;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProfileField } = profileSlice.actions;
export default profileSlice.reducer;
