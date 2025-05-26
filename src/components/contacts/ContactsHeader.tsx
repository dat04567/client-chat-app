'use client';

import React from 'react';

interface ContactsHeaderProps {
  contactCount: number;
}

const ContactsHeader: React.FC<ContactsHeaderProps> = ({ contactCount }) => {
  return (
    <div className="tyn-aside-head">
      <div className="tyn-aside-head-text">
        <h3 className="tyn-aside-title tyn-title">Liên hệ</h3>
        <span className="tyn-subtext">{contactCount} liên hệ</span>
      </div>
      <div className="tyn-aside-head-tools">
        <ul className="tyn-list-inline gap gap-3">
          <li>
            <button className="btn btn-icon btn-light btn-md btn-pill" data-bs-toggle="modal" data-bs-target="#addContact">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ContactsHeader;
