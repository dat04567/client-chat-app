'use client';
import { ChatSidebar } from '@/components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
   const router = useRouter();
   const [newMessageChat, setNewMessageChat] = useState(null);

   const handleDeleteNewChat = () => {
      setNewMessageChat(null);
   };

   return (
      <>
         <ChatSidebar 
            newMessageChat={newMessageChat} 
            onDeleteNewChat={handleDeleteNewChat} 
         />
      </>
   );
}
