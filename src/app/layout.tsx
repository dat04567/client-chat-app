// import { Inter } from 'next/font/google';
import './globals.css';

import './app.css';
import Head from 'next/head';

export const metadata = {
  title: 'Miu Miu Chat',
  description: 'Real-time chat application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="tyn-body">{children}</body>
    </html>
  );
}
