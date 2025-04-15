import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Định nghĩa API cơ bản với cấu hình chung
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    prepareHeaders: (headers) => {
      // Tự động thêm token vào header nếu có
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Chats', 'Messages', 'Users', 'Auth', 'EmailVerification', 'Conversations'],
  endpoints: () => ({}),
});

// Sử dụng để tạo các API riêng biệt
export const enhanceEndpoints = baseApi.enhanceEndpoints;