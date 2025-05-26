import { useState } from 'react';
import { useUploadFileWithPresignedUrlMutation } from '@/redux/services/mediaApi';
import { getPresignedUrlAction } from '@/app/actions/media';

interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onSuccess?: (fileUrl: string, fileData: any) => void;
  onError?: (error: string) => void;
}

interface UploadResult {
  isUploading: boolean;
  error: string | null;
  uploadProgress: number;
  uploadedFileUrl: string | null;
  uploadFile: (file: File) => Promise<string | null>;
}

/**
 * Hook để upload file thông qua presigned URL
 * Sử dụng kết hợp server action (để lấy presigned URL) và RTK Query (để upload file)
 * 
 * @param options - Tùy chọn cấu hình upload
 * @returns - Kết quả và hàm upload file
 */
export function useMediaUpload(options: UploadOptions = {}): UploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Chỉ dùng mutation của RTK Query để upload file
  // Không dùng RTK Query để lấy presigned URL (sẽ dùng server action)
  const [uploadWithPresignedUrl] = useUploadFileWithPresignedUrlMutation();

  // Giá trị mặc định
  const { 
    maxSizeMB = 10, 
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'audio/mp3', 'application/pdf'],
    onSuccess,
    onError
  } = options;

  /**
   * Upload file lên server
   * Sử dụng server action để lấy presigned URL, sau đó dùng RTK Query để upload
   * 
   * @param file - File cần upload
   * @returns - URL của file sau khi upload hoặc null nếu có lỗi
   */
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      setUploadedFileUrl(null);

      // Kiểm tra loại file
      if (!allowedTypes.includes(file.type)) {
        const error = `Loại file không được hỗ trợ. Các loại file được phép: ${allowedTypes.join(', ')}`;
        setError(error);
        onError?.(error);
        return null;
      }

      // Kiểm tra kích thước file
      const maxSizeBytes = maxSizeMB * 1024 * 1024; // Chuyển đổi MB thành bytes
      if (file.size > maxSizeBytes) {
        const error = `Kích thước file vượt quá ${maxSizeMB}MB`;
        setError(error);
        onError?.(error);
        return null;
      }
   
      // Lấy presigned URL qua server action (sử dụng cookies)
      setUploadProgress(10);
      const presignedUrlResponse = await getPresignedUrlAction({
        fileName: file.name,
        fileType: file.type
      });


      
      // Kiểm tra kết quả từ server action
      if (!presignedUrlResponse.success || !presignedUrlResponse.data) {
        const error = presignedUrlResponse.error || 'Không thể lấy đường dẫn tải lên';
        setError(error);
        onError?.(error);
        return null;
      }

      setUploadProgress(30);

      // Upload file thông qua presigned URL (sử dụng RTK Query)
      const uploadResult = await uploadWithPresignedUrl({
        presignedUrl: presignedUrlResponse.data.url,
        file,
        fileType: file.type
      }).unwrap();





      setUploadProgress(100);
      setUploadedFileUrl(uploadResult.fileUrl);
      
      // Gọi callback thành công nếu có
      onSuccess?.(uploadResult.fileUrl, presignedUrlResponse.data);
      
      return uploadResult.fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi upload file';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    error,
    uploadProgress,
    uploadedFileUrl,
    uploadFile
  };
}

export default useMediaUpload;
