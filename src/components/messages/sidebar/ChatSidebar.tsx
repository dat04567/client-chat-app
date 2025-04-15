'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetConversationsQuery } from '@/redux/services/apiSlice';
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

   // Sử dụng RTK Query hook để fetch và quản lý trạng thái conversations
   const {
      data: conversations = [],
      isLoading: loading,
      error,
   } = useGetConversationsQuery(undefined);

   // Xử lý khi chọn conversation
   const handleConversationSelect = (conversationId: number | string) => {
      setActiveId(conversationId);

      // If it's not the new message chat, navigate to that conversation
      if (conversationId !== 'new-temp-id') {
         router.push(`/messages/${conversationId}`);
      }
   };

   // Handle deleting the new message chat
   const handleDeleteNewChat = () => {
      if (onDeleteNewChat) {
         onDeleteNewChat();
      }
   };

   // Lọc conversations theo tìm kiếm
   const filteredConversations = conversations.filter((conversation) => {
      // Tìm trong tên (với one-to-one là tên người dùng, với group là tên nhóm)
      const name =
         conversation.type === 'GROUP'
            ? conversation.groupName || ''
            : conversation.participantPairKey || '';

      // Tìm trong nội dung tin nhắn cuối
      const lastMessage = conversation.lastMessageText || '';

      console.log(conversations);

      return (
         name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
   });

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
                           <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a.5.5 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
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
                                 <UserIcon width="48" height="48" className="active" />
                              </div>
                              <div className="tyn-media-col">
                                 <div className="tyn-media-row">
                                    <h6 className="name">
                                       {newMessageChat.userName === 'Tin nhắn mới'
                                          ? 'Tin nhắn mới'
                                          : newMessageChat.userName}
                                    </h6>
                                 </div>
                              </div>
                              <div className="tyn-media-option tyn-aside-item-option">
                                 <div className="tyn-media-option-list">
                                    <div
                                       className="btn btn-icon btn-white btn-pill dropdown-toggle"
                                       onClick={handleDeleteNewChat}>
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
                        Error loading conversations. Please try again.
                     </p>
                  </div>
               </>
            ) : (
               <div className="tab-content">
                  <div className="tab-pane show active" id="all-chats" tabIndex={0} role="tabpanel">
                     <ul className="tyn-aside-list">
                        {filteredConversations.length > 0
                           && filteredConversations.map((conversation) => {
                                const isGroup = conversation.type === 'GROUP';
                                const displayName = isGroup
                                   ? conversation.groupName || 'Group Chat'
                                   : conversation.participantPairKey || 'Chat';
                                // Placeholder for unread count (you may need to adjust this based on your data structure)
                                const unreadCount = 0; // This would be calculated from your data

                                return (
                                   <li
                                      key={conversation.conversationId}
                                      className={`tyn-aside-item js-toggle-main${
                                         unreadCount > 0 ? ' unread' : ''
                                      }${
                                         activeId === conversation.conversationId ? ' active' : ''
                                      }`}
                                      onClick={() =>
                                         handleConversationSelect(conversation.conversationId)
                                      }>
                                      <div className="tyn-media-group">
                                         <div className="tyn-media tyn-size-lg">
                                            <div
                                               style={{
                                                  position: 'relative',
                                                  width: '48px',
                                                  height: '48px',
                                               }}>
                                               <Image
                                                  src={
                                                     isGroup
                                                        ? '/images/avatar/default.png'
                                                        : '/images/avatar/default.png'
                                                  }
                                                  alt={displayName}
                                                  fill
                                                  style={{
                                                     objectFit: 'cover',
                                                     borderRadius: '50%',
                                                  }}
                                               />
                                            </div>
                                            {/* Could implement online status here */}
                                         </div>

                                         <div className="tyn-media-col">
                                            <div className="tyn-media-row">
                                               <h6 className="name">{conversation.partner.profile.lastName + ' ' + conversation.partner.profile.firstName}</h6>
                                               {/* <span className="typing">typing ...</span> */}
                                            </div>
                                            <div className="tyn-media-row has-dot-sap">
                                               <p className="content">
                                                  {conversation.lastMessageText}
                                               </p>
                                                <span className="meta">{formatTime(conversation.lastMessageAt)}</span>
                                            </div>

                                         </div>
                                      </div>
                                   </li>
                                );
                             })
                           }
                     </ul>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default ChatSidebar;
