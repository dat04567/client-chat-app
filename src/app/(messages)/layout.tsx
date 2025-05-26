"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { NewChatModal, AddMembersModal } from '@/components';
import { ConversationProvider, useConversation } from '@/contexts/ConversationContext';
import { toast } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';

interface MessagesLayoutProps {
  children: React.ReactNode;
}

// This is a wrapper component that will extract the conversationId from URL
const MessagesLayoutContent: React.FC<MessagesLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { setCurrentConversationId } = useConversation();
  
  useEffect(() => {
    // Extract conversationId from path like '/messages/[conversationId]'
    const match = pathname.match(/\/messages\/([^\/]+)/);
    const conversationId = match ? match[1] : null;
    setCurrentConversationId(conversationId);
  }, [pathname, setCurrentConversationId]);
  
  return (
    <div className="tyn-root">
      <Navbar />
      <div className="tyn-content tyn-content-full-height tyn-chat has-aside-base">
        {children}
      </div>

      {/* Modals */}
      <NewChatModal />
      <ToastContainer />
      <ModalWithConversationId />
    </div>
  );
};

// This component handles the AddMembersModal with current conversationId
const ModalWithConversationId = () => {
  const { currentConversationId } = useConversation();
  
  return (
    <>
      {currentConversationId && (
        <AddMembersModal 
          conversationId={currentConversationId} 
          onAddMembers={(addedMembers) => {
            toast.success(`Đã thêm ${addedMembers.length} thành viên vào nhóm`);
          }}
        />
      )}
    </>
  );
};

// Main layout that wraps everything with the provider
const MessagesLayout: React.FC<MessagesLayoutProps> = ({ children }) => {
  return (
    <ConversationProvider>
      <MessagesLayoutContent>
        {children}
      </MessagesLayoutContent>
    </ConversationProvider>
  );
};

export default MessagesLayout;