'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { formatMessageTime } from '@/utils/timeFormatters';

export interface Message {
   messageId: string;
   content: string;
   senderId: string;
   createdAt: string | Date;
   conversationId: string;
   type: string;
   status: string;
   sender: {
      id: string;
      username: string;
      profile: {
         firstName: string;
         lastName: string;
         phone: string;
      };
   };
   isCurrentUserSender: boolean;
}

interface MessageListProps {
   messages: Message[];
   currentUserId: string;
   otherUser?: {
      id: string;
      username: string;
      profile: {
         firstName: string;
         lastName: string;
         phone: string;
      };
   };
   conversationType?: string;
}

const MessageList: React.FC<MessageListProps> = ({
   messages,
   currentUserId,
   otherUser,
   conversationType,
}) => {

   
   // Group messages by date for timestamp separators
   const groupedMessages = useMemo(() => {
      const result = [];
      let lastMessageDate: string | null = null;
      let lastMessageTimestamp: Date | null = null;

      // Sort messages by timestamp (newest first)
      const sortedMessages = [...messages].sort((a, b) => {
         const dateA = new Date(a.createdAt);
         const dateB = new Date(b.createdAt);
         return dateA.getTime() - dateB.getTime(); // Changed to oldest first for better chat flow
      });

      sortedMessages.forEach((message) => {
         const messageDate = new Date(message.createdAt);
         const messageDateString = messageDate.toDateString();

         // Check if we should display a new timestamp separator
         let showTimestamp = false;

         if (!lastMessageDate || messageDateString !== lastMessageDate) {
            // Different day - always show timestamp
            showTimestamp = true;
         } else if (lastMessageTimestamp) {
            // Same day - check if gap is more than 2 hours
            const hoursDifference =
               Math.abs(lastMessageTimestamp.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
            if (hoursDifference >= 2) {
               showTimestamp = true;
            }
         }

         if (showTimestamp) {
            result.push({
               type: 'timestamp',
               timestamp: messageDate,
               id: `timestamp-${message.messageId}`,
            });
         }

         result.push({
            type: 'message',
            message,
         });

         lastMessageDate = messageDateString;
         lastMessageTimestamp = messageDate;
      });


      

      return result;
   }, [messages]);


   return (
      <div className="tyn-reply">
         {groupedMessages.map((item) => {
            if (item.type === 'timestamp') {
               return (
                  <div key={item.id} className="tyn-reply-separator">
                     {formatMessageTime(item.timestamp, 'full')}
                  </div>
               );
            }
            const { message } = item;
            const isCurrentUser = message.isCurrentUserSender;

            return (
               <div
                  key={message.messageId}
                  className={`tyn-reply-item ${isCurrentUser ? 'outgoing' : 'incoming'}`}>
                  {!isCurrentUser && (
                     <div className="tyn-reply-avatar">
                        <div className="tyn-media tyn-size-md tyn-circle">
                           <img
                              src="/images/avatar/default.png"
                              alt={otherUser?.profile.firstName || 'User'}
                           />
                        </div>
                     </div>
                  )}

                  <div className="tyn-reply-group">
                     <div className="tyn-reply-bubble">
                        {message.type === 'TEXT' && (
                           <div className="tyn-reply-text">{message.content}</div>
                        )}

                        {message.type === 'CALL' && (
                           <div className="tyn-reply-call">
                              <a href="#" className="tyn-call">
                                 <div className="tyn-media-group">
                                    <div className="tyn-media tyn-size-lg text-bg-light">
                                       <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-person-video3"
                                          viewBox="0 0 16 16">
                                          <path d="M14 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-6 5.7c0 .8.8.8.8.8h6.4s.8 0 .8-.8-.8-3.2-4-3.2-4 2.4-4 3.2"></path>
                                          <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5.243c.122-.326.295-.668.526-1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7.81c.353.23.656.496.91.783Q16 12.312 16 12V4a2 2 0 0 0-2-2z"></path>
                                       </svg>
                                    </div>
                                    <div className="tyn-media-col">
                                       <h6 className="name">
                                          {isCurrentUser ? 'Outgoing' : 'Incoming'} Audio Call
                                       </h6>
                                       <div className="meta">
                                          {formatMessageTime(message.createdAt, 'time')}
                                       </div>
                                    </div>
                                 </div>
                              </a>
                           </div>
                        )}

                        <ul className="tyn-reply-tools">
                           <li>
                              <button className="btn btn-icon btn-sm btn-transparent btn-pill">
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-emoji-smile-fill"
                                    viewBox="0 0 16 16">
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"></path>
                                 </svg>
                              </button>
                           </li>
                           <li className="dropup-center">
                              <button
                                 className="btn btn-icon btn-sm btn-transparent btn-pill"
                                 data-bs-toggle="dropdown">
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-three-dots"
                                    viewBox="0 0 16 16">
                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"></path>
                                 </svg>
                              </button>
                              <div className="dropdown-menu dropdown-menu-xxs">
                                 <ul className="tyn-list-links">
                                    <li>
                                       <a href="#">
                                          <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             width="16"
                                             height="16"
                                             fill="currentColor"
                                             className="bi bi-pencil-square"
                                             viewBox="0 0 16 16">
                                             <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"></path>
                                             <path
                                                fillRule="evenodd"
                                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"></path>
                                          </svg>
                                          <span>Edit</span>
                                       </a>
                                    </li>
                                    <li>
                                       <a href="#">
                                          <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             width="16"
                                             height="16"
                                             fill="currentColor"
                                             className="bi bi-trash"
                                             viewBox="0 0 16 16">
                                             <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"></path>
                                             <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"></path>
                                          </svg>
                                          <span>Delete</span>
                                       </a>
                                    </li>
                                 </ul>
                              </div>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
};

export default MessageList;
