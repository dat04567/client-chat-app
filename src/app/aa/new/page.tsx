"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '../../ChatLayout';

export default function NewMessagePage() {
  const router = useRouter();
  const [newChat] = useState({ 
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
    <ChatLayout 
      initialChat={newChat}
      isNewChat={true}
      onDeleteChat={handleDeleteNewChat}
    />
  );
}