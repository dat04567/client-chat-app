import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

/**
 * Extract readable error message from RTK Query error types
 */
export const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return '';
  
  if ('status' in error) {
    // This is a FetchBaseQueryError
    return 'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data 
      ? String(error.data.message) 
      : 'status' in error && error.status === 'CUSTOM_ERROR' && 'error' in error
        ? String(error.error)
        : 'Xác thực email thất bại. Vui lòng thử lại.';
  }
  
  // This is a SerializedError
  return error.message || 'Đã xảy ra lỗi không xác định.';
};