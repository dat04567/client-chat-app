'use client';

import React from 'react';

interface NotificationProps {
  success?: string | null;
  error?: string | null;
}

const Notification: React.FC<NotificationProps> = ({ success, error }) => {
  if (!success && !error) return null;
  
  return (
    <>
      {success && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
          {success}
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
          {error}
        </div>
      )}
    </>
  );
};

export default Notification;
