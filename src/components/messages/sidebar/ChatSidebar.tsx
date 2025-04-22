'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetConversationsQuery, conversationsApi } from '@/redux/services/conversationsApi';
import { formatTime } from '@/utils/formatTime';
import { UserIcon } from '@/components/icons';
import Link from 'next/link';
import useSocket from '@/hooks/useSocket';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { Conversation } from '@/redux/services/types';

interface ChatSidebarProps {
   newMessageChat?: any;
   onDeleteNewChat?: () => void;
   conversationId?: string | number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
   newMessageChat,
   onDeleteNewChat,
   conversationId,
}) => {
   const router = useRouter();
   const dispatch = useDispatch<AppDispatch>();
   const [searchQuery, setSearchQuery] = useState('');
   const [activeId, setActiveId] = useState<number | string | null>(newMessageChat?.id || conversationId || null);
   const [joinedRooms, setJoinedRooms] = useState<Record<string, boolean>>({});
   const [joinErrors, setJoinErrors] = useState<Record<string, string>>({});
   
   const conversationsRef = useRef<Conversation[]>([]);

   const { 
      data: conversations = [], 
      isLoading, 
      error 
   } = useGetConversationsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
   });

   useEffect(() => {
      conversationsRef.current = conversations;
      console.log('Conversations updated:', conversations);
      
   }, [conversations]);

   const { socket, on, off, emit, isConnected } = useSocket({
      autoConnect: true,
   });

   useEffect(() => {
      if (isConnected) {
         // Listen for new conversation events
         on<Conversation>('new-conversation', () => {
            dispatch(conversationsApi.util.invalidateTags(['Conversations']));
         });

         // Listen for join confirmation events
         on('join-confirmation', (data) => {
            console.log('Join confirmation received:', data);
            setJoinedRooms(prev => ({
               ...prev,
               [data.conversationId]: true
            }));
         });

         // Listen for join error events
         on('error', (error) => {
            if (error.conversationId) {
               console.error(`Error joining conversation ${error.conversationId}:`, error.message);
               setJoinErrors(prev => ({
                  ...prev,
                  [error.conversationId]: error.message
               }));
            }
         });

         socket?.on('connect', () => {
            console.log('Socket connected event fired');
         });
         
         socket?.on('disconnect', () => {
            console.log('Socket disconnected');
            // Clear join status when socket disconnects
            setJoinedRooms({});
         });
      } else {
         console.log('Socket not connected - cannot register event listeners');
      }

      return () => {
         off('new-conversation');
         off('join-confirmation');
         off('error');
      };
   }, [isConnected, on, off, socket, dispatch, newMessageChat, router]);

   const sortConversationsByDate = useCallback((conversations: Conversation[]) => {
      return conversations.sort((a, b) => {
         const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
         const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
         return dateB - dateA;
      });
   }, []);

   const filteredConversations = useMemo(() => {
      const lowerSearch = searchQuery.toLowerCase();

      const filtered = conversations.filter((c) => {
         const partnerName = c.recipient?.profile
            ? `${c.recipient.profile.lastName || ''} ${c.recipient.profile.firstName || ''}`.trim()
            : '';
         const groupName = c.type === 'GROUP' ? c.groupName || '' : '';
         const name = c.type === 'GROUP' ? groupName : partnerName;
         const lastMessage = c.lastMessageText || '';

         return (
            name.toLowerCase().includes(lowerSearch) ||
            lastMessage.toLowerCase().includes(lowerSearch)
         );
      });

      return sortConversationsByDate([...filtered]);
   }, [conversations, searchQuery, sortConversationsByDate]);

   const handleConversationSelect = useCallback(
      (id: number | string) => {
         setActiveId(id);

         console.log(`Selected conversation ID: ${id}`);

         // if (socket && isConnected) {
         //    console.log(`Emitting open-conversation for conversationId: ${id}`);
         //    emit('open-conversation', { conversationId: id });
            
         //    // Reset join status for this conversation until confirmation is received
         //    setJoinedRooms(prev => ({ ...prev, [id]: false }));
         //    setJoinErrors(prev => {
         //       const newErrors = { ...prev };
         //       delete newErrors[id as string];
         //       return newErrors;
         //    });
         // } 
         // else {
         //    console.log('Socket not connected - cannot open conversation');
         // }
         
         router.push(`/messages/${id}`);
      },
      [router, emit, socket, isConnected]
   );

   const handleDeleteNewChat = useCallback(() => {
      onDeleteNewChat?.();
   }, [onDeleteNewChat]);

   // Function to render join status indicator
   const renderJoinStatus = (id: string | number) => {
      if (joinErrors[id as string]) {
         return (
            <span className="join-error-indicator" title={joinErrors[id as string]}>
               <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  fill="currentColor" 
                  className="text-danger" 
                  viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
               </svg>
            </span>
         );
      }
      
      // Only show indicators for the active conversation
      if (id === activeId) {
         if (joinedRooms[id as string]) {
            return (
               <span className="join-success-indicator" title="Connected to chat room">
                  <svg 
                     xmlns="http://www.w3.org/2000/svg" 
                     width="12" 
                     height="12" 
                     fill="currentColor" 
                     className="text-success" 
                     viewBox="0 0 16 16">
                     <path d="M16 8A8 8 8 0 1 1 0 8a8 8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
               </span>
            );
         } else if (isConnected) {
            // Show connecting indicator only when socket is connected
            return (
               <span className="join-connecting-indicator" title="Connecting to chat room...">
                  <svg 
                     xmlns="http://www.w3.org/2000/svg" 
                     width="12" 
                     height="12" 
                     fill="currentColor" 
                     className="text-warning" 
                     viewBox="0 0 16 16">
                     <path d="M8 15A7 7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 8 0 1 0 8 0a8 8 8 0 0 0 0 16z"/>
                     <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
               </span>
            );
         }
      }
      
      return null;
   };

   return (
      <div className="tyn-aside tyn-aside-base">
         <div className="tyn-aside-head">
            <div className="tyn-aside-head-text">
               <h3 className="tyn-aside-title">Chats</h3>
            </div>
            <div className="tyn-aside-head-tools">
               <ul className="link-group gap gx-3">
                  <li className="dropdown">
                     <Link className="link" href="/messages/new">
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           fill="currentColor"
                           className="bi bi-plus"
                           viewBox="0 0 16 16">
                           <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                        <span>New</span>
                     </Link>
                  </li>
                  <li className="dropdown">
                     <button
                        className="link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           fill="currentColor"
                           className="bi bi-filter"
                           viewBox="0 0 16 16">
                           <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                        </svg>
                        <span>Filter</span>
                     </button>
                     <div className="dropdown-menu dropdown-menu-end">
                        <ul className="tyn-list-links nav nav-tabs border-0">
                           <li>
                              <button className="nav-link active">All Chats</button>
                           </li>
                           <li>
                              <button className="nav-link">Active Contacts</button>
                           </li>
                           <li>
                              <button className="nav-link">Archived</button>
                           </li>
                        </ul>
                     </div>
                  </li>
               </ul>
            </div>
         </div>
         <div className="tyn-aside-body" data-simplebar>
            <div className="tyn-aside-search">
               <div className="form-group tyn-pill">
                  <div className="form-control-wrap">
                     <div className="form-control-icon start">
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           fill="currentColor"
                           className="bi bi-search"
                           viewBox="0 0 16 16">
                           <path d="M11.742 10.344a6.5 6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a.5.5 0 0 0-.115-.1zM12 6.5a5.5 5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                     </div>
                     <input
                        type="text"
                        className="form-control form-control-solid"
                        id="search"
                        placeholder="Search contact / chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>
            </div>
            {newMessageChat && (
               <div className="tab-content">
                  <div className="tab-pane show active" id="all-chats" tabIndex={0} role="tabpanel">
                     <ul className="tyn-aside-list">
                        <li className="tyn-aside-item js-toggle-main active">
                           <div className="tyn-media-group">
                              <div className="tyn-media tyn-size-lg">
                                 <UserIcon width="48" height="48" className="active" />
                              </div>
                              <div className="tyn-media-col">
                                 <div className="tyn-media-row">
                                    <h6 className="name">
                                       {newMessageChat.userName === 'Tin nhắn mới'
                                          ? 'Tin nhắn mới'
                                          : newMessageChat.userName}
                                    </h6>
                                 </div>
                              </div>
                              <div className="tyn-media-option tyn-aside-item-option">
                                 <div className="tyn-media-option-list">
                                    <div
                                       className="btn btn-icon btn-white btn-pill dropdown-toggle"
                                       onClick={handleDeleteNewChat}>
                                       <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-x-lg"
                                          viewBox="0 0 16 16">
                                          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                       </svg>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </li>
                     </ul>
                  </div>
               </div>
            )}
            {isLoading ? (
               <div className="tyn-aside-item-empty text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                     <span className="visually-hidden">Loading...</span>
                  </div>
               </div>
            ) : error ? (
               <div className="tyn-aside-item-empty py-4">
                  <p className="text-center text-danger">
                     Error loading conversations. Please try again.
                  </p>
               </div>
            ) : filteredConversations.length === 0 && !newMessageChat ? (
               <div
                  className="tyn-aside-item-empty py-5 text-center d-flex flex-column align-items-center justify-content-center"
                  style={{ minHeight: '300px' }}>
                  <div
                     className="card border-0 "
                     style={{ maxWidth: '320px' }}>
                     <div className="card-body tyn-empty-state">
                        <div className="text-center mb-4">
                           <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex mb-3">
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="32"
                                 height="32"
                                 fill="currentColor"
                                 className="bi bi-chat text-primary"
                                 viewBox="0 0 16 16">
                                 <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" />
                              </svg>
                           </div>
                           <h5 className="title fw-bold">Chưa Có Cuộc Trò Chuyện Nào</h5>
                           <div className="text-muted small px-3">
                              {searchQuery ? (
                                 <p className="mb-0">
                                    Không tìm thấy cuộc trò chuyện phù hợp. Hãy thử từ khóa khác.
                                 </p>
                              ) : (
                                 <p className="mb-0">
                                    Bắt đầu cuộc trò chuyện bằng cách nhấn nút bên dưới.
                                 </p>
                              )}
                           </div>
                        </div>
                        <Link
                           href="/messages/new"
                           className="btn btn-primary rounded-pill w-100 d-flex align-items-center justify-content-center">
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-plus-circle me-2"
                              viewBox="0 0 16 16">
                              <path d="M8 15A7 7 7 0 1 1 8 1a7 7 7 0 0 1 0 14zm0 1A8 8 8 0 1 0 8 0a8 8 8 0 0 0 0 16z" />
                              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                           </svg>
                           Bắt đầu trò chuyện
                        </Link>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="tab-content">
                  <div className="tab-pane show active" id="all-chats" tabIndex={0} role="tabpanel">
                     <ul className="tyn-aside-list">
                        {filteredConversations.map((c) => {
                           const isGroup = c.type === 'GROUP';
                           const displayName = isGroup
                              ? c.groupName || 'Group Chat'
                              : c.recipient?.profile
                              ? `${c.recipient.profile.lastName || ''} ${c.recipient.profile.firstName || ''}`.trim()
                              : c.participantPairKey || 'Chat';
                           const unreadCount = 0;
                           const avatar = '/images/avatar/default.png';
                           
                           const isActive = conversationId === c.conversationId;

                           return (
                              <li
                                 key={c.conversationId}
                                 className={`tyn-aside-item js-toggle-main${
                                    unreadCount > 0 ? ' unread' : ''
                                 }${isActive ? ' active' : ''}`}
                                 onClick={() => handleConversationSelect(c.conversationId)}>
                                 <div className="tyn-media-group">
                                    <div className="tyn-media tyn-size-lg">
                                       <div
                                          style={{
                                             position: 'relative',
                                             width: '48px',
                                             height: '48px',
                                          }}>
                                          <Image
                                             src={avatar}
                                             alt={displayName}
                                             style={{ objectFit: 'cover', borderRadius: '50%' }}
                                             width={48}
                                             height={48}
                                          />
                                          {c.partner?.status === 'ONLINE' && (
                                             <span 
                                                className="status-indicator"
                                                style={{
                                                   position: 'absolute',
                                                   bottom: '2px',
                                                   right: '2px',
                                                   width: '10px',
                                                   height: '10px',
                                                   backgroundColor: '#1ee0ac',
                                                   borderRadius: '50%',
                                                   border: '2px solid white'
                                                }}
                                             />
                                          )}
                                       </div>
                                    </div>
                                    <div className="tyn-media-col">
                                       <div className="tyn-media-row">
                                          <h6 className="name d-flex align-items-center">
                                             {displayName}
                                             {renderJoinStatus(c.conversationId)}
                                          </h6>
                                          <span className="meta">
                                             {formatTime(c.lastMessageAt)}
                                          </span>
                                       </div>
                                       <div className="tyn-media-row">
                                          <p className="content">{c.lastMessageText}</p>
                                          {unreadCount > 0 && (
                                             <span className="badge bg-primary rounded-pill">{unreadCount}</span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </li>
                           );
                        })}
                     </ul>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default ChatSidebar;
