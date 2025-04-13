'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetChatsQuery } from '@/redux/services/apiSlice';
import { formatTime } from '@/utils/formatTime';
import { UserIcon } from '@/components/icons';
import Link from 'next/link';

interface ChatSidebarProps {
   newMessageChat?: any;
   onDeleteNewChat?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ newMessageChat, onDeleteNewChat }) => {
   const router = useRouter();
   const [searchQuery, setSearchQuery] = useState('');
   const [activeId, setActiveId] = useState<number | string | null>(newMessageChat?.id || null);

   // Sử dụng RTK Query hook để fetch và quản lý trạng thái chats
   const { data: chats = [], isLoading: loading, error } = useGetChatsQuery(undefined);

   // Xử lý khi chọn chat
   const handleChatSelect = (chatId: number | string) => {
      setActiveId(chatId);

      // If it's not the new message chat, navigate to that chat
      if (chatId !== 'new-temp-id') {
         // Navigate to specific chat (implementation depends on your app structure)
      }
   };

   // Handle deleting the new message chat
   const handleDeleteNewChat = () => {
      if (onDeleteNewChat) {
         onDeleteNewChat();
      }
   };

   // Lọc chats theo tìm kiếm
   const filteredChats = chats.filter(
      (chat) =>
         chat.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   return (
      <div className="tyn-aside tyn-aside-base">
         <div className="tyn-aside-head">
            <div className="tyn-aside-head-text">
               <h3 className="tyn-aside-title">Chats</h3>
            </div>
            <div className="tyn-aside-head-tools">
               <ul className="link-group gap gx-3">
                  <li className="dropdown">
                     <Link className="link" href="/messages/new">
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           fill="currentColor"
                           className="bi bi-plus"
                           viewBox="0 0 16 16">
                           <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                        <span>New</span>
                     </Link>
                  </li>
                  <li className="dropdown">
                     <button
                        className="link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           fill="currentColor"
                           className="bi bi-filter"
                           viewBox="0 0 16 16">
                           <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                        </svg>
                        <span>Filter</span>
                     </button>
                     <div className="dropdown-menu dropdown-menu-end">
                        <ul className="tyn-list-links nav nav-tabs border-0">
                           <li>
                              <button className="nav-link active">All Chats</button>
                           </li>
                           <li>
                              <button className="nav-link">Active Contacts</button>
                           </li>
                           <li>
                              <button className="nav-link">Archived</button>
                           </li>
                        </ul>
                     </div>
                  </li>
               </ul>
            </div>
         </div>

         <div className="tyn-aside-body" data-simplebar>
            <div className="tyn-aside-search">
               <div className="form-group tyn-pill">
                  <div className="form-control-wrap">
                     <div className="form-control-icon start">
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           fill="currentColor"
                           className="bi bi-search"
                           viewBox="0 0 16 16">
                           <path d="M11.742 10.344a6.5 6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                     </div>
                     <input
                        type="text"
                        className="form-control form-control-solid"
                        id="search"
                        placeholder="Search contact / chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="tab-content">
               <div className="tab-pane show active" id="all-chats" tabIndex={0} role="tabpanel">
                  <ul className="tyn-aside-list">
                     {/* New Message item if it exists */}
                     {newMessageChat && (
                        <li className="tyn-aside-item js-toggle-main active">
                           <div className="tyn-media-group">
                              <div className="tyn-media tyn-size-lg">
                                <UserIcon width='48' height='48' className='active' />
                                 {/* <Image src="images/avatar/1.jpg" alt="" /> */}
                              </div>
                              <div className="tyn-media-col">
                                 <div className="tyn-media-row">

                                    <h6 className="name">Tin nhắn mới</h6>
                          
                                 </div>
                                
                              </div>
                              <div className="tyn-media-option tyn-aside-item-option">
                                 <div className="tyn-media-option-list">
                                    <div
                                       className="btn btn-icon btn-white btn-pill dropdown-toggle"
                                        onClick={handleDeleteNewChat}
                                       >
                                       <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-x-lg"
                                          viewBox="0 0 16 16">
                                          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                       </svg>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </li>
                     )}
                  </ul>
               </div>
            </div>

            {/* Hiển thị trạng thái loading */}
            {loading && (
               <div className="tyn-aside-item-empty text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                     <span className="visually-hidden">Loading...</span>
                  </div>
               </div>
            )}

            {error ? (
               <>
                  <div className="tyn-aside-item-empty py-4">
                     <p className="text-center text-danger">
                        Error loading chats. Please try again.
                     </p>
                  </div>
               </>
            ) : (
               <div className="tab-content">
                  <div className="tab-pane show active" id="all-chats" tabIndex={0} role="tabpanel">
                     <ul className="tyn-aside-list">
                        {/* Regular chat items */}
                        {filteredChats.length > 0
                           ? filteredChats.map((chat) => (
                                <li
                                   key={chat.id}
                                   className={`tyn-aside-item js-toggle-main${
                                      chat.unreadCount > 0 ? ' unread' : ''
                                   }${activeId === chat.id ? ' active' : ''}`}
                                   onClick={() => handleChatSelect(chat.id)}>
                                   <div className="tyn-media-group">
                                      <div className="tyn-media tyn-size-lg">
                                         <div
                                            style={{
                                               position: 'relative',
                                               width: '48px',
                                               height: '48px',
                                            }}>
                                            <Image
                                               src={chat.userAvatar || '/images/avatar/default.jpg'}
                                               alt={chat.userName}
                                               fill
                                               style={{ objectFit: 'cover', borderRadius: '50%' }}
                                            />
                                         </div>
                                         {chat.isOnline && (
                                            <div className="tyn-status bg-success"></div>
                                         )}
                                      </div>
                                      <div className="tyn-media-col">
                                         <div className="tyn-media-row">
                                            <h6 className="name">{chat.userName}</h6>
                                            <span className="time">
                                               {chat.lastMessageTime
                                                  ? formatTime(chat.lastMessageTime)
                                                  : ''}
                                            </span>
                                         </div>
                                         <div className="tyn-media-row">
                                            <p className="content">
                                               {chat.lastMessage || 'Start a conversation'}
                                            </p>
                                            {chat.unreadCount > 0 && (
                                               <span className="unread">{chat.unreadCount}</span>
                                            )}
                                         </div>
                                      </div>
                                   </div>
                                </li>
                             ))
                           : !newMessageChat && (
                                <div className="tyn-aside-item-empty py-4">
                                   <p className="text-center text-muted">
                                      {searchQuery ? 'No chats match your search' : 'No chats yet'}
                                   </p>
                                </div>
                             )}
                     </ul>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default ChatSidebar;
