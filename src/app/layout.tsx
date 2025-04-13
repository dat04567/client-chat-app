// import { Inter } from 'next/font/google';
import './globals.css';
import './app.css';
import Script from 'next/script';
import { Providers } from '@/redux/provider';

export const metadata = {
   title: 'Miu Miu Chat',
   description: 'Real-time chat application',
};

export default function RootLayout({ children }) {
   return (
      <html lang="en">
         <body className="tyn-body">
            <Providers>{children}</Providers>
            <Script src="/js/bootstrap.js" strategy="afterInteractive" />
         </body>
      </html>
   );
}
