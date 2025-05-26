"use server";

import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * Thông tin yêu cầu tạo presigned URL
 */
export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
}

/**
 * Kết quả trả về từ API presigned URL
 */
export interface PresignedUrlResponse {
  url: string;          // Đường dẫn presigned URL để upload file
  fileName: string;     // Tên file độc nhất được tạo cho việc upload
  fileType: string;     // Loại file (ví dụ: image/jpeg, video/mp4)
  maxFileSize: number;  // Kích thước tối đa cho phép tính bằng bytes (ví dụ: 10 MB)
}

/**
 * Server action để lấy presigned URL từ API
 * Sử dụng cookies để xác thực người dùng
 */
export async function getPresignedUrlAction(request: PresignedUrlRequest): Promise<{
  success: boolean;
  data?: PresignedUrlResponse;
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;

    if (!token) {
      return { success: false, error: 'Không có phiên đăng nhập' };
    }

    // Gọi API để lấy presigned URL
    const response = await axios.post(
      `${apiUrl}/media/presigned-url`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Không thể lấy presigned URL');
    }


    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        error: error.response.data.message || error.response.data.error || "Không thể lấy presigned URL" 
      };
    }
    return { 
      success: false, 
      error: 'Không thể lấy presigned URL' 
    };
  }
}
