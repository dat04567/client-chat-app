import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import VerifyEmailClient from './client';

// Server Component
export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies();
  const emailFromCookie = cookieStore.get('pendingVerificationEmail')?.value;
  
  // Check for email in search params as backup
  const emailFromParams = searchParams.email as string | undefined;
  
  // Use email from cookie or from URL params
  const email = emailFromCookie || emailFromParams;
  

  
  
  // If no email is found in either cookie or URL params, redirect to register
  if (!email) {
    redirect('/register');
  }
  
  // Pass email to client component and wrap with Redux Provider
  return <VerifyEmailClient serverEmail={email} />

}