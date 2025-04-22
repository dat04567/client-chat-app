"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList, { Message } from './MessageList';
import ChatInput from './ChatInput';
import ChatOptions from './ChatOptions';
import useSocket from '@/hooks/useSocket';

interface ChatMainProps {
  chat?: any;
  showOptions?: boolean;
  onToggleOptions?: () => void;
  isNewChat?: boolean;
  conversationData?: {
    messages: Message[];
    lastEvaluatedKey: string | null;
    currentUserId: string;
    otherUser: {
      id: string;
      username: string;
      profile: {
        firstName: string;
        lastName: string;
        phone: string;
      }
    };
    conversationType: string;
    conversation?: any;
  };
}

const ChatMain: React.FC<ChatMainProps> = ({ 
  chat, 
  showOptions, 
  onToggleOptions, 
  isNewChat = false,
  conversationData
}) => {
  // Fallback messages for development/testing
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isConversationJoined, setIsConversationJoined] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Socket connection
  const { socket, on, off, emit, isConnected } = useSocket({
    autoConnect: true,
  });

  // Initialize messages from conversationData if available
  useEffect(() => {
    if (conversationData?.messages) {
      setMessages(conversationData.messages);
    }
  }, [conversationData]);

  // Set up socket event listeners
  useEffect(() => {
    if (isConnected && conversationData?.conversation?.conversationId) {
      const conversationId = conversationData.conversation.conversationId;
      
      // Listen for successful connection to conversation
      on('open-conversation-success', (data) => {
        if (data.conversationId === conversationId) {
          console.log(`Successfully joined conversation: ${conversationId}`);
          setIsConversationJoined(true);
        }
      });
      
      // Emit open-conversation event when component mounts
      emit('open-conversation', { conversationId });
      
      // Listen for new messages
      on('new-message', (newMessage) => {
        if (newMessage.conversationId === conversationId) {
          setMessages(prev => [...prev, newMessage]);
        }
      });
      
      // Listen for errors
      on('error', (error) => {
        console.error('Socket error:', error);
        // You might want to show an error message to the user
      });
    }
    
    return () => {
      // Clean up event listeners
      off('open-conversation-success');
      off('new-message');
      off('error');
    };
  }, [isConnected, conversationData, on, off, emit]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !isConversationJoined) return;
    
    const conversationId = conversationData?.conversation?.conversationId;
    if (!conversationId) {
      console.error('No conversation ID available');
      return;
    }
    
    // Add new message to the local state for immediate display
    const newMessage: Message = {
      messageId: `temp-${Date.now()}`,
      conversationId,
      senderId: conversationData.currentUserId || 'current-user',
      content,
      createdAt: new Date().toISOString(),
      type: 'TEXT',
      status: 'SENDING',
      isCurrentUserSender: true,
      sender: {
        id: conversationData.currentUserId || 'current-user',
        username: 'Me',
        profile: {
          firstName: 'Me',
          lastName: '',
          phone: ''
        }
      }
    };
    
    setMessages([...messages, newMessage]);
    
    // Send the message through the socket connection
    if (socket && isConnected) {
      emit('send-message', {
        conversationId,
        content,
        type: 'TEXT'
      });
    } else {
      console.error('Socket not connected - cannot send message');
    }
  };

  return (
    <div className="tyn-main tyn-chat-content" id="tynMain">
      <ChatHeader 
        chat={chat} 
        onToggleSearch={() => setSearchVisible(!searchVisible)}
        onToggleOptions={onToggleOptions}
        searchVisible={searchVisible}
        isNewChat={isNewChat}
      />
      
      <div className="tyn-chat-body js-scroll-to-end" id="tynChatBody" ref={chatBodyRef}>
        <MessageList 
          messages={messages} 
          currentUserId={conversationData?.currentUserId || ''} 
          otherUser={conversationData?.otherUser}
          conversationType={conversationData?.conversationType} 
        />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isConversationJoined={isConversationJoined}
      />
      
      {showOptions && (
        <ChatOptions chat={chat} isNewChat={isNewChat} />
      )}
    </div>
  );
};

export default ChatMain;