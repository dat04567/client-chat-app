"use client";

import React, { useState, ReactNode } from 'react';
import ChatSidebar from '@/components/messages/sidebar/ChatSidebar';
import ChatMain from '@/components/messages/chat/ChatMain';
import NewChatModal from '@/components/messages/modals/NewChatModal';

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
    <>
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

      {/* Modals */}
      <NewChatModal />
    </>
  );
};

export default ChatLayout;