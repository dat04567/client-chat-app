"use client";

import React, { useRef, useState } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "react-toastify";

interface MediaUploaderProps {
  onFileUploaded?: (fileUrl: string, fileData: any) => void;
  onError?: (error: string) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
  buttonText?: string;
  buttonClassName?: string;
  buttonIcon?: React.ReactNode;
  children?: React.ReactNode;
  multiple?: boolean;
}

/**
 * Component dùng để upload file media
 */
const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFileUploaded,
  onError,
  allowedTypes,
  maxSizeMB = 10,
  buttonText = "Tải lên",
  buttonClassName = "btn btn-light",
  buttonIcon,
  children,
  multiple = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { uploadFile } = useMediaUpload({
    maxSizeMB,
    allowedTypes,
    onSuccess: (fileUrl, fileData) => {
      onFileUploaded?.(fileUrl, fileData);
    },
    onError: (error) => {
      toast.error(error);
      onError?.(error);
    },
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Xử lý từng file được chọn
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(file);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      // Reset file input để có thể chọn cùng một file nhiều lần
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      {children ? (
        <div onClick={handleClick} style={{ cursor: "pointer" }}>
          {children}
        </div>
      ) : (
        <button
          className={buttonClassName}
          onClick={handleClick}
          disabled={uploading}
          type="button"
        >
          {uploading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : (
            buttonIcon
          )}
          {buttonText}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple={multiple}
        accept={allowedTypes?.join(",")}
      />
    </>
  );
};

export default MediaUploader;
