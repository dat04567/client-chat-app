'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Participant {
   id: string;
   name: string;
}

interface ChatHeaderProps {
   title: string;
   participants?: Participant[];
   onToggleSearch?: () => void;
   onToggleOptions?: () => void;
   searchVisible?: boolean;
   isOnline?: boolean;
   onToggleSidebar?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
   title,
   participants = [],
   onToggleSearch,
   onToggleOptions,
   searchVisible = false,
   isOnline = false,
   onToggleSidebar,
}) => {
   const defaultAvatar = '/images/avatar/default.png';

   return (
      <>
         <div className="tyn-chat-head">
            {/* Mobile back button */}
            <ul className="tyn-list-inline d-md-none ms-n1">
               <li>
                  <button className="btn btn-icon btn-md btn-pill btn-transparent js-toggle-main">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-arrow-left"
                        viewBox="0 0 16 16">
                        <path
                           fillRule="evenodd"
                           d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                        />
                     </svg>
                  </button>
               </li>
            </ul>

            {/* User profile section */}
            <div className="tyn-media-group">
               <div className="tyn-media tyn-size-lg d-none d-sm-inline-flex">
                  <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                     <Image
                        src={defaultAvatar}
                        alt={title}
                        fill
                        style={{ objectFit: 'cover', borderRadius: '50%' }}
                     />
                  </div>
               </div>
               <div className="tyn-media tyn-size-rg d-sm-none">
                  <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                     <Image
                        src={defaultAvatar}
                        alt={title}
                        fill
                        style={{ objectFit: 'cover', borderRadius: '50%' }}
                     />
                  </div>
               </div>
               <div className="tyn-media-col">
                  <div className="tyn-media-row">
                     <h6 className="name">{title}</h6>
                  </div>
                  <div className="tyn-media-row has-dot-sap">
                     <span className="meta">{isOnline ? 'Trực tuyến' : 'Không trực tuyến'}</span>
                  </div>
               </div>
            </div>

            {/* Action buttons */}
            <ul className="tyn-list-inline gap gap-3 ms-auto">
               <li className="d-none d-sm-block">
                  <button className="btn btn-icon btn-light" onClick={onToggleSearch}>
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-search"
                        viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                     </svg>
                  </button>
               </li>
               <li>
                  <button className="btn btn-icon btn-light" onClick={onToggleOptions}>
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-three-dots-vertical"
                        viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                     </svg>
                  </button>
               </li>
               <li>
                  <button className="btn btn-icon btn-light" onClick={onToggleSidebar}>
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-layout-sidebar-inset-reverse"
                        viewBox="0 0 16 16">
                        <path d="M2 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"></path>
                        <path d="M13 4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"></path>
                     </svg>
                  </button>
               </li>
            </ul>

            {/* Search component - only shown when searchVisible is true */}
            {searchVisible && (
               <div className="tyn-chat-search" id="tynChatSearch">
                  <div className="flex-grow-1">
                     <div className="form-group">
                        <div className="form-control-wrap form-control-plaintext-wrap">
                           <input
                              type="text"
                              className="form-control-plaintext"
                              id="searchChat"
                              placeholder="Tìm kiếm trong cuộc trò chuyện"
                           />
                        </div>
                     </div>
                  </div>
                  <div className="d-flex align-items-center">
                     <button className="btn btn-sm btn-icon btn-transparent" onClick={onToggleSearch}>
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           fill="currentColor"
                           className="bi bi-x-lg"
                           viewBox="0 0 16 16">
                           <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                        </svg>
                     </button>
                  </div>
               </div>
            )}
         </div>
      </>
   );
};

export default ChatHeader;
