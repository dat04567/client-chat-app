// Tập trung export tất cả các API từ các module con
import { baseApi } from './baseApi';
// Re-export các hooks từ mỗi API
export * from './authApi';
export * from './chatsApi';
export * from './usersApi';
export * from './types';

// Export API gốc để sử dụng trong cấu hình store
export const apiSlice = baseApi;