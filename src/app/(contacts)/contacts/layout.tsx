import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacts | Chat App',
  description: 'Manage your contacts and friend requests',
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}

// Redirect from the base path to the "all" contacts tab
export function generateStaticParams() {
  return [];
}
