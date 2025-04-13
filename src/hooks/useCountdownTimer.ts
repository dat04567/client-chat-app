
'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { decrementCountdown } from '@/redux/features/email/emailVerificationSlice';


/**
 * Custom hook to handle countdown timer for email verification
 */
export const useCountdownTimer = () => {
  const dispatch = useAppDispatch();
  const { countdown } = useAppSelector(state => state.emailVerification);

  // Set up countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(decrementCountdown());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [dispatch]);

  return { countdown };
};