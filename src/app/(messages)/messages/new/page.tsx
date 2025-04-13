'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '../../layout/ChatLayout';
import { ChatHeader, ChatMain, ChatSidebar } from '@/components';

export default function NewMessagePage() {
   const router = useRouter();
   const [newMessageChat] = useState({
      id: 'new-temp-id',
      userName: '', // This will be filled when selecting a user
      userAvatar: '/images/avatar/default.png',
      isOnline: false,
      lastMessage: 'Tin nhắn mới',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
   });

   // Handle the deletion of the new message chat
   const handleDeleteNewChat = () => {
      // Navigate back to the main messages page
      router.push('/messages');
   };

   return (
      <>
         <ChatSidebar newMessageChat={newMessageChat} onDeleteNewChat={handleDeleteNewChat} />

         <div className="tyn-main tyn-chat-content" id="tynMain">
              <div className="tyn-chat-head">
                  <ul className="tyn-list-inline d-md-none ms-n1">
                    <li>
                      <button className="btn btn-icon btn-md btn-pill btn-transparent js-toggle-main">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                        </svg>
                      </button>
                    </li>
                  </ul>
                  
                  
                </div>
         </div>
      </>
   );
}
