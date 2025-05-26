'use client';

import Image from 'next/image';
import React from 'react';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  isFavorite: boolean;
  isBlocked: boolean;
  isNew: boolean;
}

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  error: any;
  selectedContact: Contact | null;
  onContactClick: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isLoading,
  error,
  selectedContact,
  onContactClick
}) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        {error}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3 d-flex justify-content-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-people text-muted" viewBox="0 0 16 16">
            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
          </svg>
        </div>
        <h6 className="text-muted">No contacts found</h6>
        <p className="text-muted small">You don&apos;t have any contacts in this category</p>
      </div>
    );
  }

  return (
    <ul className="tyn-aside-list">
      {contacts.map(contact => (
        <li 
          key={contact.id} 
          className={`tyn-aside-item js-toggle-main ${selectedContact?.id === contact.id ? 'active' : ''}`}
          onClick={() => onContactClick(contact)}
        >
          <div className="tyn-media-group">
            <div className="tyn-media tyn-size-lg">
              {/* <Image src={contact.avatar} alt={contact.name} /> */}
              {contact.status === 'online' && (
                <div className="tyn-media-status text-bg-success"></div>
              )}
            </div>
            <div className="tyn-media-col">
              <div className="tyn-media-row">
                <h6 className="name">{contact.name}</h6>
                {contact.isNew && (
                  <span className="badge text-bg-primary text-white rounded-pill">New</span>
                )}
              </div>
              <div className="tyn-media-row">
                <p className="content">{contact.username}</p>
              </div>
            </div>
            <div className="tyn-media-option tyn-aside-item-option">
              <ul className="tyn-media-option-list">
                <li>
                  <button className="btn btn-icon btn-md btn-white btn-pill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-text-fill" viewBox="0 0 16 16">
                      <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ContactList;
