"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { formatMessageTime } from '@/utils/timeFormatters';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string | Date;
  conversationId: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId 
}) => {
  // Group messages by date for timestamp separators
  const groupedMessages = useMemo(() => {
    const result = [];
    let lastMessageDate: string | null = null;
    let lastMessageTimestamp: Date | null = null;
    
    // Sort messages by timestamp (newest first)
    const sortedMessages = [...messages].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
    sortedMessages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      const messageDateString = messageDate.toDateString();
      
      // Check if we should display a new timestamp separator
      let showTimestamp = false;
      
      if (!lastMessageDate || messageDateString !== lastMessageDate) {
        // Different day - always show timestamp
        showTimestamp = true;
      } else if (lastMessageTimestamp) {
        // Same day - check if gap is more than 2 hours
        const hoursDifference = (lastMessageTimestamp.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
        if (hoursDifference >= 2) {
          showTimestamp = true;
        }
      }
      
      if (showTimestamp) {
        result.push({
          type: 'timestamp',
          timestamp: messageDate,
          id: `timestamp-${message.id}`
        });
      }
      
      result.push({
        type: 'message',
        message
      });
      
      lastMessageDate = messageDateString;
      lastMessageTimestamp = messageDate;
    });
    
    return result;
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="tyn-chat-empty">
        <div className="tyn-text-center">
          <Image src="/images/chat-empty.svg" alt="No messages" width={200} height={200} />
          <p>Không có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tyn-reply-box">
      {groupedMessages.map(item => {
        if (item.type === 'timestamp') {
          return (
            <div key={item.id} className="tyn-reply-separator">
              {formatMessageTime(item.timestamp, 'full')}
            </div>
          );
        }
        
        const { message } = item;
        const isCurrentUser = message.senderId === currentUserId;
        
        return (
          <div 
            key={message.id} 
            className={`tyn-reply-item ${isCurrentUser ? 'tyn-reply-me' : ''}`}
          >
            <div className="tyn-reply-bubble">
              <div className="tyn-reply-text">
                {message.content}
              </div>
              <div className="tyn-reply-time">
                {formatMessageTime(message.timestamp, 'time')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};