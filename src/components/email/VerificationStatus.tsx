import React from 'react';
import Link from 'next/link';

interface VerificationStatusProps {
  isVerifying: boolean;
  verificationStatus: {
    success?: boolean;
    message?: string;
  };
  errorMessage?: string | null;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  isVerifying, 
  verificationStatus,
  errorMessage 
}) => {
  if (isVerifying) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang xác thực...</span>
        </div>
        <p className="mt-2">Đang xác thực email của bạn...</p>
      </div>
    );
  }

  if (verificationStatus.success) {
    return (
      <div className="alert alert-success">
        <p className="mb-0">{verificationStatus.message || "Xác thực email thành công!"}</p>
        <p className="mt-2 mb-0">Bạn sẽ được chuyển hướng đến trang đăng nhập sau vài giây...</p>
      </div>
    );
  }

  // Ưu tiên hiển thị lỗi từ errorMessage prop (từ try-catch)
  if (errorMessage) {
    const isTokenExpired = 
      errorMessage.includes("Liên kết xác thực đã hết hạn") || 
      errorMessage.includes("Token không hợp lệ") ||
      errorMessage.includes("expired") ||
      errorMessage.includes("invalid");
    
    const errorTitle = isTokenExpired 
      ? "Link xác thực không hợp lệ hoặc đã hết hạn!" 
      : "Xác thực email thất bại!";
      
    return (
      <div className="alert alert-danger">
        <h5 className="alert-heading">{errorTitle}</h5>
        <p className="mb-0">
          {isTokenExpired 
            ? "Link xác thực này đã hết hạn hoặc không còn hợp lệ. Vui lòng sử dụng nút bên dưới để gửi lại email xác thực mới."
            : "Đã xảy ra lỗi trong quá trình xác thực email của bạn. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vẫn gặp vấn đề."}
        </p>
        <hr />
        <p className="mb-0 small">
          Chi tiết: {errorMessage}
        </p>
      </div>
    );
  }

  // Fallback to message from verification status if no explicit error
  if (verificationStatus.message && !verificationStatus.success) {
    const isTokenExpired = 
      verificationStatus.message.includes("Liên kết xác thực đã hết hạn") || 
      verificationStatus.message.includes("Token không hợp lệ") ||
      verificationStatus.message.includes("expired") ||
      verificationStatus.message.includes("invalid");
    
    const errorTitle = isTokenExpired 
      ? "Link xác thực không hợp lệ hoặc đã hết hạn!" 
      : "Xác thực email thất bại!";
    
    const errorMessage = isTokenExpired
      ? "Link xác thực này đã hết hạn hoặc không còn hợp lệ. Vui lòng sử dụng nút bên dưới để gửi lại email xác thực mới."
      : "Đã xảy ra lỗi trong quá trình xác thực email của bạn. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vẫn gặp vấn đề.";
    
    return (
      <div className="alert alert-danger">
        <h5 className="alert-heading">{errorTitle}</h5>
        <p className="mb-0">{errorMessage}</p>
        <hr />
        <p className="mb-0 small">
          Chi tiết: {verificationStatus.message}
        </p>
      </div>
    );
  }

  return null;
};

export default VerificationStatus;