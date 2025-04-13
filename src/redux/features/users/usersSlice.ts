import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Định nghĩa interface User
export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  isContact: boolean;
}

// Định nghĩa interface UsersState
interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

// Trạng thái ban đầu
const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Tạo async thunk để fetch contacts
export const fetchContacts = createAsyncThunk(
  'users/fetchContacts',
  async (searchQuery: string, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await axios.get(`${apiUrl}/users/contacts?search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue('Không thể tải danh sách liên hệ');
    }
  }
);

// Tạo async thunk để search users
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (searchQuery: string, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await axios.get(`${apiUrl}/users/search?query=${encodeURIComponent(searchQuery)}`);
      
      return response.data;
    } catch (error) {
      return rejectWithValue('Đã xảy ra lỗi khi tìm kiếm người dùng');
    }
  }
);

// Tạo users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchContacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // searchUsers
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsers } = usersSlice.actions;

export default usersSlice.reducer;