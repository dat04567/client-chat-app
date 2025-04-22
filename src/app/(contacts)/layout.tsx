import React from 'react';
import { Navbar, NavItem } from '@/components/layout';
import { AddContactModal } from '@/components/contacts';

interface ContactsLayoutProps {
   children: React.ReactNode;
}

export default function ContactsLayout({ children }: ContactsLayoutProps) {
   return (
      <div className="tyn-root">
         <Navbar />
         <div className="tyn-content tyn-contact has-aside-base">{children}</div>
         {/* Add Contact Modal */}
         <AddContactModal />
      </div>
   );
}
