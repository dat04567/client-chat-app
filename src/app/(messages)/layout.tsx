"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { NewChatModal, AddMembersModal } from '@/components';

interface MessagesLayoutProps {
  children: React.ReactNode;
}

const MessagesLayout: React.FC<MessagesLayoutProps> = ({ children }) => {
  return (
    <div className="tyn-root">
      <Navbar />
      <div className="tyn-content tyn-content-full-height tyn-chat has-aside-base">
        {children}
      </div>

      {/* Modals */}
      <NewChatModal />
      <AddMembersModal  conversationId=''/>


    </div>
  );
};

export default MessagesLayout;