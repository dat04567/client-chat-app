'use client';

import React from 'react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

interface ContactProfileProps {
  contact: Contact;
  isMainShown: boolean;
  toggleMainView: () => void;
}

const ContactProfile: React.FC<ContactProfileProps> = ({ contact, isMainShown, toggleMainView }) => {
  return (
    <div className={`tyn-main tyn-content-inner ${isMainShown ? 'main-shown' : ''}`} id="tynMain" >
      <div className="container">
        <div className="tyn-profile">
          <ul className="tyn-list-inline d-md-none translate-middle position-absolute start-50 z-1">
            <li>
              <button className="btn btn-icon btn-pill btn-white js-toggle-main" onClick={toggleMainView}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
              </button>
            </li>
          </ul>
          
          <div className="tyn-profile-head">
            <div className="tyn-profile-cover">
              {/* <img className="tyn-profile-cover-image" src="/images/cover/2.jpg" alt="" /> */}
            </div>
            <div className="tyn-profile-info">
              <div className="tyn-media-group align-items-start">
                <div className="tyn-media tyn-media-bordered tyn-size-4xl tyn-profile-avatar">
                  {/* <img src={contact.avatar} alt={contact.name} /> */}
                  {contact.status === 'online' && (
                    <div className="tyn-media-status text-bg-success"></div>
                  )}
                </div>
                <div className="tyn-media-col">
                  <h3 className="tyn-media-name">{contact.name}</h3>
                  <div className="tyn-media-desc">
                    <p>Status: {contact.status === 'online' ? 'Online' : contact.status === 'away' ? 'Away' : 'Offline'}</p>
                    <p>Username: {contact.username}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="tyn-profile-nav">
            <ul className="nav nav-tabs nav-tabs-line border-0">
              <li className="nav-item">
                <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-about" type="button">About</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-contacts" type="button">Mutual Contacts</button>
              </li>
            </ul>
            <ul className="tyn-list-inline gap gap-3 ms-auto me-n1">
              <li>
                <Link href={`/messages/new?userId=${contact.id}`} className="btn btn-primary btn-md">
                  <span>Message</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="tyn-profile-details">
            <div className="tab-content">
              <div className="tab-pane show active" id="profile-about" tabIndex={0}>
                <div className="row gy-4">
                  <div className="col-md-6 col-lg-8">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">About Me</h5>
                        <p className="card-text">
                          No information available
                        </p>
                        <h6 className="mt-4">Contact Information</h6>
                        <ul className="list-group list-group-borderless">
                          <li className="list-group-item ps-0">
                            <span className="title">Email:</span>
                            <span className="text">{contact.username.replace('@', '')}@example.com</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">Basic Information</h5>
                        <ul className="list-group list-group-borderless">
                          <li className="list-group-item ps-0">
                            <span className="title">Status:</span>
                            <span className="text">
                              {contact.status === 'online' ? 'Active now' : 
                               contact.status === 'away' ? 'Away' : 'Offline'}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="tab-pane" id="profile-contacts" tabIndex={0}>
                <div className="text-center py-5">
                  <div className="mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-people text-muted" viewBox="0 0 16 16">
                      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                    </svg>
                  </div>
                  <h6 className="text-muted">No mutual contacts</h6>
                  <p className="text-muted small">You don&apos;t have any mutual contacts with this user</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;
