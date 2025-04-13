import React from 'react';

interface EmailWaitingInfoProps {
  email: string | null;
  resendStatus: {
    success?: boolean;
    message?: string;
  };
}

const EmailWaitingInfo: React.FC<EmailWaitingInfoProps> = ({ email, resendStatus }) => {
  return (
    <>
      {resendStatus.message && (
        <div className={`alert ${resendStatus.success ? 'alert-success' : 'alert-danger'}`}>
          <p className="mb-0">{resendStatus.message}</p>
        </div>
      )}
      
      <div className="alert alert-info">
        <p>Chúng tôi đã gửi email xác thực đến:</p>
        <p className="fw-bold">{email}</p>
        <p>Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để hoàn tất quá trình đăng ký.</p>
      </div>
    </>
  );
};

export default EmailWaitingInfo;