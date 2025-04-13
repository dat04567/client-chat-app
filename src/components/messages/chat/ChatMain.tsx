"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatOptions from './ChatOptions';

const ChatMain = ({ chat, showOptions, onToggleOptions, isNewChat = false }) => {
  const [messages, setMessages] = useState([
    // For new chats, start with an empty conversation
    ...(isNewChat ? [] : [
      // Example messages - in a real app these would come from an API
      { id: 1, sender: 'other', content: 'Hi there! How are you doing today?', time: '10:00 AM' },
      { id: 2, sender: 'me', content: 'I\'m doing well, thanks for asking!', time: '10:02 AM' },
      { id: 3, sender: 'me', content: 'How about you?', time: '10:02 AM' },
      { id: 4, sender: 'other', content: 'I\'m great! Just working on some projects.', time: '10:05 AM' },
      { id: 5, sender: 'other', content: 'By the way, have you seen the latest updates?', time: '10:06 AM' },
      { id: 6, sender: 'me', content: 'Not yet, what updates?', time: '10:10 AM' },
    ])
  ]);

  const [searchVisible, setSearchVisible] = useState(false);
  const chatBodyRef = useRef(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (content) => {
    if (!content.trim()) return;
    
    // Add new message to the list
    const newMessage = {
      id: messages.length + 1,
      sender: 'me',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
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
        {isNewChat && messages.length === 0 ? (
          <div className="tyn-chat-welcome text-center py-5">
            <div className="tyn-chat-welcome-icon mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-chat-text" viewBox="0 0 16 16">
                <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 3.25-.97a1 1 0 0 1 .71.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8zm0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </div>
            <h4 className="mb-2">Start a New Conversation</h4>
            <p className="text-muted">Type a message below to start chatting</p>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
      
      {showOptions && (
        <ChatOptions chat={chat} isNewChat={isNewChat} />
      )}
    </div>
  );
};

export default ChatMain;