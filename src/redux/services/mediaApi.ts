import { baseApi } from './baseApi';
import { getPresignedUrlAction } from '@/app/actions/media';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Import và export lại các interface từ server action
 */
import type { PresignedUrlRequest, PresignedUrlResponse } from '@/app/actions/media';
export type { PresignedUrlRequest, PresignedUrlResponse };

/**
 * Thông tin file đã upload
 */
export interface UploadedFileInfo {
  fileUrl: string;      // Đường dẫn công khai của file sau khi upload
  fileName: string;     // Tên file đã được lưu trữ
  fileSize: number;     // Kích thước file tính bằng byte
  fileType: string;     // Mime type của file
}

/**
 * API service cho media
 */
export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Lấy presigned URL để upload file
     * Sử dụng server action thay vì gọi API trực tiếp 
     */
    getPresignedUrl: builder.mutation<PresignedUrlResponse, PresignedUrlRequest>({
      queryFn: async (request) => {
        try {
          // Gọi server action để lấy presigned URL (sẽ sử dụng cookies)
          const response = await getPresignedUrlAction(request);
          
          if (response.success && response.data) {
            return { data: response.data };
          } else {
            const error: FetchBaseQueryError = {
              status: 'CUSTOM_ERROR',
              error: response.error || 'Failed to get presigned URL'
            };
            return { error };
          }
        } catch (error: any) {
          const fetchError: FetchBaseQueryError = {
            status: 'FETCH_ERROR',
            error: error.message || 'Failed to get presigned URL' 
          };
          return { error: fetchError };
        }
      },
      invalidatesTags: ['Media'],
    }),
    
    /**
     * Upload file sử dụng presigned URL
     * Hàm này không thực hiện API call qua baseApi mà sẽ gọi trực tiếp lên presigned URL
     */
    uploadFileWithPresignedUrl: builder.mutation<UploadedFileInfo, { presignedUrl: string; file: File; fileType: string }>({
      queryFn: async ({ presignedUrl, file, fileType }) => {
        try {
          // Upload file lên S3 thông qua presigned URL
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': fileType,

            },
          });
          

          if (!uploadResponse.ok) {
            const error: FetchBaseQueryError = {
              status: uploadResponse.status,
              error: `Upload failed with status: ${uploadResponse.status}`
            };
            return { error };
          }
          
          // S3 presigned URL PUT requests don't return JSON data
          // Create file info from the original request data
          const fileUrl = presignedUrl.split('?')[0]; // Get the base URL without query params
          const fileInfo: UploadedFileInfo = {
            fileUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          };
          
          return { data: fileInfo };
        } catch (error) {
          console.error('Error uploading file:', error);
          const fetchError: FetchBaseQueryError = {
            status: 'FETCH_ERROR',
            error: 'Failed to upload file'
          };
          return { error: fetchError };
        }
      },
    }),
  }),
});

// Export các hook để sử dụng trong các component
export const { useGetPresignedUrlMutation, useUploadFileWithPresignedUrlMutation } = mediaApi;
