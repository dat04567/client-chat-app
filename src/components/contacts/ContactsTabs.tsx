'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ContactsTabsProps {
  activeTab: 'all' | 'new' | 'favorites' | 'blocked' | 'sent-requests' | 'invitations';
  setActiveTab: (tab: 'all' | 'new' | 'favorites' | 'blocked' | 'sent-requests' | 'invitations') => void;
  receivedRequestsCount: number;
  sentRequestsCount: number;
}

const ContactsTabs: React.FC<ContactsTabsProps> = ({
  activeTab,
  setActiveTab,
  receivedRequestsCount,
  sentRequestsCount
}) => {
  const pathname = usePathname();
  
  // Get the current tab from URL to ensure UI is in sync with the URL
  React.useEffect(() => {
    if (pathname.includes('/contacts/')) {
      const segments = pathname.split('/');
      const lastSegment = segments[segments.length - 1];
      if (['all', 'new', 'favorites', 'blocked', 'invitations', 'sent-requets'].includes(lastSegment) && 
          lastSegment !== activeTab) {
        setActiveTab(lastSegment as any);
      }
    }
  }, [pathname, setActiveTab, activeTab]);
  
  return (
    <div className="tyn-aside-row pt-0">
      <ul className="nav nav-tabs nav-tabs-line">
        <li className="nav-item">
          <Link 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} 
            href="/contacts/all"
          >
            All 
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            className={`nav-link ${activeTab === 'new' ? 'active' : ''}`} 
            href="/contacts/new"
          >
            New 
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`} 
            href="/contacts/favorites"
          >
            Favorites 
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            className={`nav-link ${activeTab === 'invitations' ? 'active' : ''}`} 
            href="/contacts/invitations"
          >
            Invitations
            {receivedRequestsCount > 0 && (
              <span className="badge bg-primary text-white rounded-pill ms-1">{receivedRequestsCount}</span>
            )}
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            className={`nav-link ${activeTab === 'sent-requests' ? 'active' : ''}`} 
            href="/contacts/sent-requests"
          >
            Sent
            {sentRequestsCount > 0 && (
              <span className="badge bg-secondary text-white rounded-pill ms-1">{sentRequestsCount}</span>
            )}
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            className={`nav-link ${activeTab === 'blocked' ? 'active' : ''}`} 
            href="/contacts/blocked"
          >
            Blocked 
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ContactsTabs;
