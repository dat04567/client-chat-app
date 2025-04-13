import React from 'react';

interface CountdownTimerProps {
  countdown: number;
  isResending: boolean;
  onResendEmail: () => void;
  formatTime: (time: number) => string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  countdown,
  isResending,
  onResendEmail,
  formatTime
}) => {
  return (
    <div className="mt-4 text-center">
      {!isResending ? (
        <button
          onClick={onResendEmail}
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
      
      {countdown > 0 && (
        <p className="mt-2 text-muted">
          Vui lòng đợi {formatTime(countdown)} trước khi gửi lại
        </p>
      )}
    </div>
  );
};

export default CountdownTimer;