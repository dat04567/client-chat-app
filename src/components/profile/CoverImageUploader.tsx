"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { toast } from 'react-toastify';

interface CoverImageUploaderProps {
  initialImageUrl: string;
  onImageUploaded?: (imageUrl: string) => void;
}

const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({ initialImageUrl, onImageUploaded }) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const { isUploading, uploadProgress, uploadFile } = useMediaUpload({
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    onSuccess: (fileUrl) => {
      setImageUrl(fileUrl);
      onImageUploaded?.(fileUrl);
      toast.success('Ảnh bìa đã được cập nhật thành công!');
    },
    onError: (error) => {
      toast.error(`Không thể tải lên ảnh bìa: ${error}`);
    }
  });

  const triggerFileSelector = () => {
    // Tạo input element để chọn file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/webp,image/gif';
    
    // Xử lý khi chọn file
    fileInput.onchange = async (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        await uploadFile(file);
      }
    };
    
    // Mở dialog chọn file
    fileInput.click();
  };

  return (
    <div className="tyn-profile-cover position-relative">
      <div className="position-relative" style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
        {isUploading ? (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-75">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <div className="mt-2">{uploadProgress}%</div>
            </div>
          </div>
        ) : null}
        
        <Image
          className="tyn-profile-cover-image"
          src={imageUrl}
          alt="Profile cover"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
      
      <a
        href="#cover-upload"
        onClick={(e) => {
          e.preventDefault();
          triggerFileSelector();
        }}
        className="tyn-cover-upload position-absolute"
        style={{ bottom: '10px', right: '10px', zIndex: 2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.6 2h-1.2c-.2 0-.5.2-.5.4v9.2c0 .2.2.4.5.4h1.2c.2 0 .5-.2.5-.4V2.4c0-.2-.2-.4-.5-.4z"></path>
          <path d="M8.7 6.7a.5.5 0 0 0 .8 0l3-4.1c.2-.2.1-.6-.2-.6h-6.6c-.3 0-.4.4-.2.6l3.2 4.1z"></path>
          <path d="M21.4 13.5L17 10.7a1 1 0 0 0-1.3.2L12 16l-3.6-5.1a1 1 0 0 0-1.4-.2L2.6 13.6a1 1 0 0 0-.3 1.1l2.2 7.5a1 1 0 0 0 1 .8H19a1 1 0 0 0 .9-.8l2-7.5a1 1 0 0 0-.5-1.2zm-8.9 5.3a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
        </svg>
        <span className="tyn-cover-upload-label">Tải lên ảnh bìa</span>
      </a>
    </div>
  );
};

export default CoverImageUploader;
