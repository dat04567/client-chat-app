// import { Inter } from 'next/font/google';
import './globals.css';
import './app.css';
import 'glightbox/dist/css/glightbox.min.css';
import Script from 'next/script';
import { Providers } from '@/redux/provider';
import { Toaster } from 'react-hot-toast';

export const metadata = {
   title: 'Miu Miu Chat',
   description: 'Real-time chat application',
};

export default function RootLayout({ children }) {
   return (
      <html lang="en">
         <body className="tyn-body">
            <Providers>
               <Toaster position="top-right" />
               {children}
            </Providers>
            <Script src="/js/bootstrap.js" strategy="afterInteractive" />
            {/* <Script src="/js/app.js" strategy="afterInteractive" /> */}
         </body>
      </html>
   );
}
