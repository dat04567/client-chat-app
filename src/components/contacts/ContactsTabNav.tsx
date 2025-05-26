'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ContactsTabNavProps {
  receivedRequestsCount: number;
  sentRequestsCount: number;
}

const ContactsTabNav: React.FC<ContactsTabNavProps> = ({
  receivedRequestsCount,
  sentRequestsCount
}) => {
  const pathname = usePathname();
  
  // Extract the current tab from URL
  let currentTab: string = 'all';
  if (pathname.includes('/contacts/')) {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    if (['all', 'new', 'favorites', 'blocked', 'invitations', 'sent-requests'].includes(lastSegment)) {
      currentTab = lastSegment;
    }
  }

  return (
    <div className="tyn-aside-row pt-0">
      <ul className="nav nav-tabs nav-tabs-line">
        <li className="nav-item">
          <Link
            href="/contacts/all"
            className={`nav-link ${currentTab === 'all' ? 'active' : ''}`}
          >
            All 
          </Link>
        </li>
        <li className="nav-item">
          <Link
            href="/contacts/new"
            className={`nav-link ${currentTab === 'new' ? 'active' : ''}`}
          >
            New 
          </Link>
        </li>
        <li className="nav-item">
          <Link
            href="/contacts/favorites"
            className={`nav-link ${currentTab === 'favorites' ? 'active' : ''}`}
          >
            Favorites 
          </Link>
        </li>
        <li className="nav-item">
          <Link
            href="/contacts/invitations"
            className={`nav-link ${currentTab === 'invitations' ? 'active' : ''}`}
          >
            Invitations
            {receivedRequestsCount > 0 && (
              <span className="badge bg-primary text-white rounded-pill ms-1">{receivedRequestsCount}</span>
            )}
          </Link>
        </li>
        <li className="nav-item">
          <Link
            href="/contacts/sent-requests"
            className={`nav-link ${currentTab === 'sent-requests' ? 'active' : ''}`}
          >
            Sent
            {sentRequestsCount > 0 && (
              <span className="badge bg-secondary text-white rounded-pill ms-1">{sentRequestsCount}</span>
            )}
          </Link>
        </li>
        <li className="nav-item">
          <Link
            href="/contacts/blocked"
            className={`nav-link ${currentTab === 'blocked' ? 'active' : ''}`}
          >
            Blocked 
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ContactsTabNav;
