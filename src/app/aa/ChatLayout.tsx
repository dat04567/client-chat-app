"use client";

import Navbar from '@/components/layout/Navbar';
import ChatSidebar from '@/components/messages/sidebar/ChatSidebar';
import ChatMain from '@/components/messages/chat/ChatMain';
import NewChatModal from '@/components/messages/modals/NewChatModal';
import React, { useState, ReactNode } from 'react';

interface Chat {
  id: string;
  userName: string;
  userAvatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatLayoutProps {
  initialChat?: Chat;
  isNewChat?: boolean;
  children?: ReactNode;
  onDeleteChat?: () => void;
}

const ChatLayout = ({ initialChat, isNewChat = false, children, onDeleteChat }: ChatLayoutProps) => {
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [activeChat, setActiveChat] = useState(initialChat || null);
  
  return (
    <div className="tyn-root">
      <Navbar />
      
      <div className="tyn-content tyn-content-full-height tyn-chat has-aside-base">
        <ChatSidebar 
          newMessageChat={isNewChat ? activeChat : undefined} 
          onDeleteNewChat={isNewChat ? onDeleteChat : undefined} 
        />
        {activeChat && (
          <ChatMain 
            chat={activeChat} 
            showOptions={showChatOptions}
            onToggleOptions={() => setShowChatOptions(!showChatOptions)} 
            isNewChat={isNewChat}
          />
        )}
        {children}
      </div>
      
      {/* Modals */}
      <NewChatModal />
    </div>
  );
};

export default ChatLayout;