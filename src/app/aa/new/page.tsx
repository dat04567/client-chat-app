"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ChatSidebar from '@/components/messages/sidebar/ChatSidebar';
import ChatMain from '@/components/messages/chat/ChatMain';
import NewChatModal from '@/components/messages/modals/NewChatModal';

export default function NewMessagePage() {
  const router = useRouter();
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [newChat, setNewChat] = useState({ 
    id: 'new-temp-id',
    userName: 'New Message',
    userAvatar: '/images/avatar/default.jpg',
    isOnline: false,
    lastMessage: 'Start a new conversation',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0
  });
  
  // Handle the deletion of the new message chat
  const handleDeleteNewChat = () => {
    // Navigate back to the main messages page
    router.push('/messages');
  };

  return (
    <div className="tyn-root">
      <Navbar />
      
      <div className="tyn-content tyn-content-full-height tyn-chat has-aside-base">
        <ChatSidebar newMessageChat={newChat} onDeleteNewChat={handleDeleteNewChat} />
        {/* <ChatMain 
          chat={newChat} 
          showOptions={showChatOptions}
          onToggleOptions={() => setShowChatOptions(!showChatOptions)} 
          isNewChat={true}
        /> */}
      </div>
      
      {/* Modals */}
      <NewChatModal />
    </div>
  );
}