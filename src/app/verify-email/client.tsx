'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {VerifyEmailContainer} from '@/components';

interface ClientProps {
   serverEmail?: string;
}

export default function VerifyEmailClient({ serverEmail }: ClientProps) {
   const router = useRouter();
   const searchParams = useSearchParams();

   // Get token and userId from URL (if any)
   const token = searchParams.get('token');
   const userId = searchParams.get('userId');
   const email = serverEmail;

   // Check if email is available (middleware already checked token and userId)
   useEffect(() => {
      if (!email) {
         router.push('/register');
      }
   }, [email, router]);

   if (!email) {
      return (
         <div className="text-center p-8">
            <div className="spinner-border" role="status">
               <span className="sr-only">Loading...</span>
            </div>
         </div>
      );
   }

   // Pass email to VerifyEmailContainer
   return (
      <VerifyEmailContainer
         email={email}
         initialToken={token || undefined}
         initialUserId={userId || undefined}
      />
   );
}
