'use client';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from '@/redux/services/apiSlice';
import { getErrorMessage } from '@/utils/errorHandlers';

interface UseEmailVerificationProps {
  email: string;
  token?: string;
  userId?: string;
}

interface VerificationResult {
  isVerifying: boolean;
  isResending: boolean;
  verificationResponse: any;
  resendResponse: any;
  verifyErrorMessage: string;
  resendErrorMessage: string;
  handleResendEmail: () => void;
}

/**
 * Custom hook to handle email verification logic
 */
export const useEmailVerification = ({
  email,
  token,
  userId
}: UseEmailVerificationProps): VerificationResult => {
  const router = useRouter();
  const hasVerifiedRef = useRef(false);
  
  // RTK Query hooks
  const [verifyEmail, { isLoading: isVerifying, data: verificationResponse, error: verifyError }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending, data: resendResponse, error: resendError }] = useResendVerificationEmailMutation();
  
  // Extracted error messages
  const verifyErrorMessage = useMemo(() => getErrorMessage(verifyError), [verifyError]);
  const resendErrorMessage = useMemo(() => getErrorMessage(resendError), [resendError]);

  // Handle email verification
  useEffect(() => {
    if (token && userId && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      
      verifyEmail({ token, userId })
        .unwrap()
        .then(result => {
          if (result.success) {
            // Redirect to login page after successful verification
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          }
        })
        .catch(err => {
          console.error('Verification error:', err);
        });
    }
  }, [token, userId, verifyEmail, router]);

  // Handle resend verification email
  const handleResendEmail = useCallback(() => {
    if (email) {
      resendVerificationEmail(email)
        .unwrap()
        .catch(err => {
          console.error('Resend error:', err);
        });
    }
  }, [email, resendVerificationEmail]);

  return {
    isVerifying,
    isResending,
    verificationResponse,
    resendResponse,
    verifyErrorMessage,
    resendErrorMessage,
    handleResendEmail
  };
};