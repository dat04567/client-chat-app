import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import EmailLayout from './EmailLayout';
import VerificationStatus from './VerificationStatus';
import EmailWaitingInfo from './EmailWaitingInfo';
import CountdownTimer from './CountdownTimer';
import Link from 'next/link';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { formatCountdownTime } from '@/utils/timeFormatters';

interface VerifyEmailContainerProps {
  email: string;
  initialToken?: string;
  initialUserId?: string;
}

const VerifyEmailContainer: React.FC<VerifyEmailContainerProps> = ({
  email,
  initialToken,
  initialUserId
}) => {
  // Use our custom hooks
  const { countdown } = useCountdownTimer();
  const {
    isVerifying,
    isResending,
    verificationResponse,
    resendResponse,
    verifyErrorMessage,
    resendErrorMessage,
    handleResendEmail
  } = useEmailVerification({
    email,
    token: initialToken,
    userId: initialUserId
  });

  // Nếu có token và userId, hiển thị trạng thái xác thực
  if (initialToken && initialUserId) {
    return (
      <EmailLayout>
        <VerificationStatus 
          isVerifying={isVerifying}
          verificationStatus={verificationResponse  || {}}
          errorMessage={verifyErrorMessage}
        />
        <div className="text-center mt-3">
          {verificationResponse?.success ? (
            <Link href="/login" className="btn btn-primary">
              Đi đến trang đăng nhập
            </Link>
          ) : (
            <div className="mt-4">
              
              {!isResending ? (
                <button 
                  onClick={handleResendEmail}
                  className="btn btn-primary"
                  disabled={countdown > 0}
                >
                  Gửi lại email xác thực
                </button>
              ) : (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang gửi...</span>
                  </div>
                </div>
              )}
              {resendResponse?.success && (
                <div className="alert alert-success mt-3" role="alert">
                  Email xác thực đã được gửi lại thành công. Vui lòng kiểm tra hộp thư của bạn.
                </div>
              )}
              {resendErrorMessage && (
                <div className="alert alert-danger mt-3">
                  {resendErrorMessage}
                </div>
              )}
              
              {countdown > 0 && (
                <p className="mt-2 text-muted">
                  Vui lòng đợi {formatCountdownTime(countdown)} trước khi gửi lại
                </p>
              )}
            </div>
          )}
        </div>
      </EmailLayout>
    );
  }

  // Nếu chỉ có email, hiển thị màn hình chờ xác thực
  return (
    <EmailLayout>
      <EmailWaitingInfo email={email} resendStatus={resendResponse || {}} />
      <CountdownTimer
        countdown={countdown}
        isResending={isResending}
        onResendEmail={handleResendEmail}
        formatTime={formatCountdownTime}
      />
      {resendErrorMessage && (
        <div className="alert alert-danger mt-3">
          {resendErrorMessage}
        </div>
      )}
    </EmailLayout>
  );
};

export default VerifyEmailContainer;