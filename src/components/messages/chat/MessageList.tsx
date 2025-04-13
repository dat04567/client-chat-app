"use client";

import React from 'react';

const MessageList = ({ messages }) => {
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach((message) => {
      // In a real app, you would compare actual dates
      // For now, we'll just use the time string for demonstration
      if (!currentGroup || currentGroup.date !== message.time.split(' ')[0]) {
        currentGroup = {
          date: message.time.split(' ')[0],
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <div className="tyn-reply" id="tynReply">
      {messageGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {groupIndex > 0 && (
            <div className="tyn-reply-separator">{group.date}</div>
          )}
          
          {group.messages.map((message, index) => {
            const isOutgoing = message.sender === 'me';
            const previousMessage = index > 0 ? group.messages[index - 1] : null;
            const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null;
            
            // Determine if this is the start of a new group of messages from the same sender
            const isNewSenderGroup = !previousMessage || previousMessage.sender !== message.sender;
            
            return (
              <div 
                key={message.id} 
                className={`tyn-reply-item ${isOutgoing ? 'outgoing' : 'incoming'}`}
              >
                {!isOutgoing && isNewSenderGroup && (
                  <div className="tyn-reply-avatar">
                    <div className="tyn-media tyn-size-md tyn-circle">
                      <img src="/images/avatar/1.jpg" alt="User" />
                    </div>
                  </div>
                )}
                
                <div className="tyn-reply-group">
                  <div className="tyn-reply-bubble">
                    <div className="tyn-reply-text">
                      {message.content}
                    </div>
                    <div className="tyn-reply-meta">
                      <span className="time">{message.time}</span>
                      {isOutgoing && (
                        <span className="status delivered">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2-all" viewBox="0 0 16 16">
                            <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"/>
                            <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z"/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageList;