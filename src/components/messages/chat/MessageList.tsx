'use client';

import React, { useMemo, useEffect } from 'react';
import Image from 'next/image';
import { formatMessageTime } from '@/utils/timeFormatters';
import useGLightbox from '@/hooks/useGLightbox';

export interface Message {
   messageId: string;
   content: string;
   senderId: string;
   createdAt: string | Date;
   updatedAt?: string;
   conversationId: string;
   type: string;
   status: string;
   senderName?: string;
   sender?: {
      id: string;
      username?: string;
      profile?: {
         firstName: string;
         lastName: string;
         phone: string;
      };
   };
   isCurrentUserSender?: boolean;
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

   // Initialize GLightbox for media elements
   const { reload } = useGLightbox('.glightbox', {
      touchNavigation: true,
      loop: true,
      autoplayVideos: true,
      plyr: {
         config: {
            ratio: '16:9',
            muted: false,
            hideControls: false,
            youtube: {
               noCookie: true,
               rel: 0,
               showinfo: 0
            },
            vimeo: {
               byline: false,
               portrait: false,
               title: false,
               speed: true,
               transparent: false
            }
         }
      }
   }, [messages]);

   // Reload GLightbox whenever messages change to catch newly added media elements
   useEffect(() => {
      reload();
   }, [messages, reload]);

   
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
            // const isCurrentUser = message.senderId === currentUserId;

            return (
               <div
                  key={message.messageId}
                  className={`tyn-reply-item ${isCurrentUser ? 'outgoing' : 'incoming'}`}>
                  {!isCurrentUser && (
                     <div className="tyn-reply-avatar">
                        <div className="tyn-media tyn-size-md tyn-circle">
                           <Image
                              src="/images/avatar/default.png"
                              alt={otherUser?.profile.firstName || 'User'}
                              width={40}
                              height={40}
                           />
                        </div>
                     </div>
                  )}

                  <div className="tyn-reply-group">
                     <div className="tyn-reply-bubble">
                        {message.type === 'TEXT' && (
                           <div className="tyn-reply-text">{message.content}</div>
                        )}

                        {message.type === 'MEDIA' && (
                           <div className="">
                              {message.content && message.content.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) ? (
                                 // Nếu là hình ảnh
                                 <div className="tyn-reply-group">
                                    <div className="tyn-reply-media">
                                        <a  href={message.content}  className="glightbox tyn-thumb"  data-glightbox="type: image">
                                            <Image
                                                src={message.content}
                                                className="tyn-image"
                                                alt="Media"
                                                width={240}
                                                height={180}
                                                style={{
                                                    maxWidth: '240px',
                                                    borderRadius: '8px',
                                                    objectFit: 'contain',
                                                    height: 'auto'
                                                }}
                                            />
                                        </a>
                                    </div>
                                    
                                    
                                 </div>
                              ) : message.content && message.content.toLowerCase().match(/\.(mp4|webm|ogg|avi|mov|flv|wmv)$/) ? (
                                 // Nếu là video
                                    <div className="tyn-reply-media">
                                        <a 
                                            href={message.content} 
                                            className="glightbox tyn-video" 
                                            data-glightbox="type: video"
                                        >
                                            <div className="tyn-video-thumb" style={{ 
                                                width: '240px', 
                                                height: '180px', 
                                                borderRadius: '8px',
                                                backgroundColor: '#000',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div className="tyn-video-icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" className="bi bi-play-fill" viewBox="0 0 16 16">
                                                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                              ) : message.content && message.content.toLowerCase().match(/\.(mp3|wav|ogg)$/) ? (
                                 // Nếu là audio
                                 <div className="tyn-reply-audio">
                                    <audio controls>
                                       <source src={message.content} />
                                       Your browser does not support the audio element.
                                    </audio>
                                 </div>
                              ) : (
                                 // Document handling based on file type
                                 <div className="tyn-reply-file">
                                    <a 
                                       href={message.content} 
                                       target="_blank"
                                       rel="noopener noreferrer" 
                                       className="tyn-file"
                                    >
                                       <div className="tyn-media-group">
                                          <div className="tyn-media tyn-size-lg text-bg-light">
                                             {message.content.toLowerCase().match(/\.(doc|docx)$/) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-docx" viewBox="0 0 16 16">
                                                   <path fillRule="evenodd" d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zm-6.839 9.688v-.522a1.5 1.5 0 0 0-.117-.641.86.86 0 0 0-.322-.387.86.86 0 0 0-.469-.129.87.87 0 0 0-.471.13.87.87 0 0 0-.32.386 1.5 1.5 0 0 0-.117.641v.522q0 .384.117.641a.87.87 0 0 0 .32.387.9.9 0 0 0 .471.126.9.9 0 0 0 .469-.126.86.86 0 0 0 .322-.386 1.55 1.55 0 0 0 .117-.642m.803-.516v.513q0 .563-.205.973a1.47 1.47 0 0 1-.589.627q-.381.216-.917.216a1.86 1.86 0 0 1-.92-.216 1.46 1.46 0 0 1-.589-.627 2.15 2.15 0 0 1-.205-.973v-.513q0-.569.205-.975.205-.411.59-.627.386-.22.92-.22.535 0 .916.22.383.219.59.63.204.406.204.972M1 15.925v-3.999h1.459q.609 0 1.005.235.396.233.589.68.196.445.196 1.074 0 .634-.196 1.084-.197.451-.595.689-.396.237-.999.237zm1.354-3.354H1.79v2.707h.563q.277 0 .483-.082a.8.8 0 0 0 .334-.252q.132-.17.196-.422a2.3 2.3 0 0 0 .068-.592q0-.45-.118-.753a.9.9 0 0 0-.354-.454q-.237-.152-.61-.152Zm6.756 1.116q0-.373.103-.633a.87.87 0 0 1 .301-.398.8.8 0 0 1 .475-.138q.225 0 .398.097a.7.7 0 0 1 .273.26.85.85 0 0 1 .12.381h.765v-.073a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.49-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.571.633-.197.41-.197.978v.498q0 .568.194.976.195.406.571.627.375.216.914.216.44 0 .785-.164t.551-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.765a.8.8 0 0 1-.117.364.7.7 0 0 1-.273.248.9.9 0 0 1-.401.088.85.85 0 0 1-.478-.131.83.83 0 0 1-.298-.393 1.7 1.7 0 0 1-.103-.627zm5.092-1.76h.894l-1.275 2.006 1.254 1.992h-.908l-.85-1.415h-.035l-.852 1.415h-.862l1.24-2.015-1.228-1.984h.932l.832 1.439h.035z"></path>
                                                </svg>
                                             )}
                                             {message.content.toLowerCase().match(/\.(pdf)$/) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-pdf" viewBox="0 0 16 16">
                                                   <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.238.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522Zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 0 0 .595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 0 0-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362Zm.791.645h.563c.248 0 .45.05.609.152a.89.89 0 0 1 .354.454c.079.201.118.452.118.753a2.3 2.3 0 0 1-.068.592 1.14 1.14 0 0 1-.196.422.8.8 0 0 1-.334.252 1.298 1.298 0 0 1-.483.082h-.563v-2.707Zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638H7.896Z"/>
                                                </svg>
                                             )}
                                             {message.content.toLowerCase().match(/\.(xls|xlsx)$/) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-xlsx" viewBox="0 0 16 16">
                                                   <path fillRule="evenodd" d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM7.86 14.841a1.13 1.13 0 0 0 .401.823c.13.108.29.192.479.252.19.061.411.091.665.091.338 0 .624-.053.858-.158.237-.105.416-.252.54-.44a1.17 1.17 0 0 0 .187-.656c0-.224-.045-.41-.135-.56a1.002 1.002 0 0 0-.375-.357 2.028 2.028 0 0 0-.565-.21l-.621-.144a.97.97 0 0 1-.405-.176.37.37 0 0 1-.143-.299c0-.156.061-.284.184-.384.125-.101.296-.152.513-.152.143 0 .266.023.37.068a.624.624 0 0 1 .245.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.199-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.552.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.123.524.082.149.199.27.351.367.153.095.332.167.54.213l.618.144c.207.049.36.113.462.193a.387.387 0 0 1 .153.326.512.512 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.25.07-.413.07-.117 0-.224-.013-.32-.04a.837.837 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM.806 13.693c0-.248.034-.46.103-.633a.868.868 0 0 1 .301-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.44 1.44 0 0 0-.489-.272 1.836 1.836 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm6.12.009c0-.248.034-.46.102-.633a.868.868 0 0 1 .301-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.44 1.44 0 0 0-.489-.272 1.836 1.836 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm5.092-4.931c0-.248.034-.46.102-.633a.868.868 0 0 1 .301-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.44 1.44 0 0 0-.489-.272 1.836 1.836 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Z"/>
                                                </svg>
                                             )}
                                             {message.content.toLowerCase().match(/\.(ppt|pptx)$/) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-pptx" viewBox="0 0 16 16">
                                                   <path fillRule="evenodd" d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474.108-.201.161-.436.161-.704 0-.267-.053-.501-.158-.703a1.171 1.171 0 0 0-.46-.474c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.237.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.295.185.522Zm1.964-1.333v3.999h.791V11.85H4.11Zm2.831 0c-.332 0-.608.089-.826.267-.219.179-.328.431-.328.759 0 .17.039.319.118.447.079.128.19.228.331.3.14.072.3.126.477.163.178.037.37.063.576.079.173.014.311.027.415.04.105.012.185.03.241.052a.27.27 0 0 1 .116.097.306.306 0 0 1 .04.159.453.453 0 0 1-.116.306.465.465 0 0 1-.333.126.488.488 0 0 1-.262-.071.372.372 0 0 1-.168-.19.696.696 0 0 1-.061-.282H6.3v.076c0 .163.032.318.097.467a1.2 1.2 0 0 0 .281.39c.122.11.27.198.442.262.173.064.367.097.582.097.327 0 .604-.089.829-.267a.874.874 0 0 0 .337-.723.781.781 0 0 0-.113-.442.73.73 0 0 0-.329-.314 1.697 1.697 0 0 0-.511-.183 9.583 9.583 0 0 0-.69-.097 2.492 2.492 0 0 1-.376-.055.623.623 0 0 1-.255-.117.29.29 0 0 1-.096-.219c0-.125.048-.222.144-.29a.559.559 0 0 1 .331-.103.5.5 0 0 1 .254.066.437.437 0 0 1 .174.19.571.571 0 0 1 .066.273h.765v-.057a1.1 1.1 0 0 0-.087-.462.945.945 0 0 0-.253-.375 1.236 1.236 0 0 0-.439-.263 1.911 1.911 0 0 0-.663-.097Zm3.632.012v3.998h.788v-1.765h.79v1.765h.79v-3.998h-.79v1.595h-.79v-1.595h-.788Zm3.368 0v3.998h.768v-3.998h-.768Z"/>
                                                </svg>
                                             )}
                                             {message.content.toLowerCase().match(/\.(zip|rar|7z|tar|gz|bz2)$/) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-zip" viewBox="0 0 16 16">
                                                   <path d="M6.5 7.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v.938l.4 1.599a1 1 0 0 1-.416 1.074l-.93.62a1 1 0 0 1-1.109 0l-.93-.62a1 1 0 0 1-.415-1.074l.4-1.599V7.5zm2 0h-1v.938a1 1 0 0 1-.03.243l-.4 1.598.93.62.93-.62-.4-1.598a1 1 0 0 1-.03-.243V7.5z"/>
                                                   <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                                                </svg>
                                             )}
                                             {/* Fallback icon for any other file type */}
                                             {!message.content.toLowerCase().match(/\.(doc|docx|pdf|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|bz2)$/) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark" viewBox="0 0 16 16">
                                                   <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                                                </svg>
                                             )}
                                          </div>
                                          <div className="tyn-media-col">
                                             <h6 className="name">
                                                {(() => {
                                                   const filename = message.content.split('/').pop() || 'Document';
                                                   // Remove UUID prefix if it exists (pattern: uuid_filename.ext)
                                                   return filename.includes('_') ? filename.substring(filename.indexOf('_') + 1) : filename;
                                                })()}
                                             </h6>
                                             <div className="meta">Click to download</div>
                                          </div>
                                       </div>
                                    </a>
                                 </div>
                              )}
                           </div>
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
