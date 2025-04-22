'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChatHeader, ChatInput, ChatSidebar, MessageList } from '@/components';
import {
   useGetConversationMessagesQuery,
   useSendMessageMutation,
   useGetConversationsQuery,
   conversationsApi
} from '@/redux/services/conversationsApi';
import { useSocket } from '@/hooks/useSocket';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

export default function ConversationPage() {
   const params = useParams();
   const router = useRouter();
   const dispatch = useDispatch<AppDispatch>();
   const { conversationId } = params;
   const [error, setError] = useState(null);
   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const [lastEvaluatedMessageId, setLastEvaluatedMessageId] = useState<string | null>(null);
   const [showChatSidebar, setShowChatSidebar] = useState(false);
   const [searchVisible, setSearchVisible] = useState(false);

   const messagesEndRef = useRef(null);
   const initialRenderRef = useRef(true);
   
   // Initialize socket connection
   const { on, off, emit, connect, isConnected } = useSocket();
   const [hasJoinedConversation, setHasJoinedConversation] = useState(false);
   
   // Connect to socket when component mounts
   useEffect(() => {
      connect();
      
      // Return cleanup function to disconnect when component unmounts
      return () => {};
   }, [connect]);

   // Set up socket event handlers for conversation joining
   useEffect(() => {
      if (isConnected && conversationId) {
         // Emit event to join the conversation room
         emit('open-conversation', { conversationId });
         
         // Listen for join errors
         on('error', (error) => {
            console.error('Error joining conversation:', error.message);
            setError(error.message);
         });
      }
      
      return () => {
         // Clean up event listeners when component unmounts
         off('join-confirmation');
         off('error');
      };
   }, [isConnected, conversationId, emit, on, off]);

   // Toggle sidebar function
   const toggleChatSidebar = useCallback(() => {
      setShowChatSidebar(prev => !prev);
   }, []);

   // Toggle search function
   const toggleSearch = useCallback(() => {
      setSearchVisible(prev => !prev);
   }, []);

   // Get current conversation messages
   const {
      data: conversationData,
      isLoading: isLoadingMessages,
      isError,
      isFetching,
   } = useGetConversationMessagesQuery(
      {
         conversationId: conversationId as string,
         limit: 20,
         lastEvaluatedMessageId,
      },
      {
         refetchOnMountOrArgChange: false,
         refetchOnFocus: false,
         refetchOnReconnect: false,
         staleTime: 30000,
      }
   );

   const { data: conversations = [], isLoading: isLoadingConversations } = useGetConversationsQuery(
      undefined,
      {
         refetchOnMountOrArgChange: false,
         refetchOnFocus: false,
         refetchOnReconnect: false,
         staleTime: 30000,
      }
   );

   const currentConversation = useMemo(
      () => conversations.find((c) => c.conversationId === conversationId),
      [conversations, conversationId]
   );
   
   const partnerProfile = currentConversation?.partner?.profile;

   const messages = useMemo(() => conversationData?.messages || [], [conversationData]);
   const otherUser = useMemo(() => conversationData?.otherUser || null, [conversationData]);
   const conversationType = useMemo(
      () => conversationData?.conversationType || 'ONE-TO-ONE',
      [conversationData]
   );
   const currentUserId = useMemo(() => conversationData?.currentUserId, [conversationData]);
   const hasMoreMessages = useMemo(
      () => !!conversationData?.lastEvaluatedKey,
      [conversationData]
   );

   useEffect(() => {
      if (messagesEndRef.current && messages.length > 0 && !isLoadingMore) {
         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
   }, [messages, isLoadingMore]);

   const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

   useEffect(() => {
      on('new-message', (data) => {
         if (data.conversationId === conversationId) {
            const newMessage = {
               messageId: data.messageId || data.id,
               conversationId: data.conversationId,
               senderId: data.senderId,
               content: data.content,
               createdAt: data.createdAt || new Date().toISOString(),
               type: data.type || 'TEXT',
               status: 'DELIVERED',
               isCurrentUserSender: data.senderId === currentUserId,
               sender: data.sender || {
                  id: data.senderId,
                  username: data.senderName || 'User',
                  profile: data.senderProfile || {}
               }
            };

            dispatch(
               conversationsApi.util.updateQueryData(
                  'getConversationMessages',
                  {
                     conversationId: conversationId as string,
                     limit: 20,
                     lastEvaluatedMessageId: null,
                  },
                  (draft) => {
                     if (draft && Array.isArray(draft.messages)) {
                        const exists = draft.messages.some(msg => 
                           msg.messageId === newMessage.messageId
                        );
                        
                        if (!exists) {
                           draft.messages.push(newMessage);
                        }
                     }
                  }
               )
            );
         }
      });

      return () => {
         off('new-message');
      };
   }, [conversationId, on, off, dispatch, currentUserId]);

   const handleLoadMoreMessages = useCallback(() => {
      if (!isLoadingMore && hasMoreMessages) {
         setIsLoadingMore(true);
         
         const firstMessageId = messages.length > 0 ? messages[0].id : null;
         
         setLastEvaluatedMessageId(firstMessageId);
         
         setTimeout(() => {
            setIsLoadingMore(false);
         }, 1000);
      }
   }, [isLoadingMore, hasMoreMessages, messages]);

   const handleSendMessage = useCallback(
      (content: string) => {
         if (content.trim()) {
            const messageData = {
               conversationId: conversationId as string,
               content: content.trim(),
               senderId: currentUserId,
               type: 'TEXT',
               createdAt: new Date().toISOString(),
            };

            emit('send-message', messageData);

            const optimisticMessage = {
               messageId: `temp-${Date.now()}`,
               conversationId: conversationId as string,
               senderId: currentUserId,
               content: content.trim(),
               createdAt: new Date().toISOString(),
               type: 'TEXT',
               status: 'SENDING',
               isCurrentUserSender: true,
               sender: {
                  id: currentUserId,
               }
            };

            dispatch(
               conversationsApi.util.updateQueryData(
                  'getConversationMessages',
                  {
                     conversationId: conversationId as string,
                     limit: 20,
                     lastEvaluatedMessageId: null,
                  },
                  (draft) => {
                     if (draft && Array.isArray(draft.messages)) {
                        draft.messages.push(optimisticMessage);
                     }
                  }
               )
            );
         }
      },
      [conversationId, currentUserId, emit, dispatch]
   );

   if (isLoadingMessages || isLoadingConversations) {
      return (
         <>
            <ChatSidebar conversationId={conversationId as string} />
            <div className="tyn-main tyn-chat-content">
               <div className="tyn-chat-body d-flex justify-content-center align-items-center">
                  <div className="tyn-chat-body-inner">
                     <div className="centered-loading">
                        <div className="spinner-border text-primary" role="status">
                           <span className="visually-hidden">Loading...</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }

   if (isError || error) {
      return (
         <>
            <ChatSidebar conversationId={conversationId as string} />
            <div className="tyn-main tyn-chat-content">
               <div className="tyn-chat-body d-flex justify-content-center align-items-center">
                  <div className="tyn-chat-body-inner">
                     <div className="centered-error">
                        <p>{error || 'Không thể tải cuộc trò chuyện'}</p>
                        <button 
                           onClick={() => window.location.reload()} 
                           className="btn btn-primary mt-2"
                        >
                           Thử lại
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }

   const displayName = partnerProfile 
      ? `${partnerProfile.lastName || ''} ${partnerProfile.firstName || ''}`.trim()
      : otherUser?.username || 'Unknown User';

   const participants = otherUser
      ? [{ id: otherUser.id || '1', name: otherUser.username || displayName }]
      : [];

   const isOnline = otherUser?.isOnline || false;


  
   
   return (
      <>
         <ChatSidebar conversationId={conversationId as string} />
         <div className={`tyn-main tyn-chat-content ${showChatSidebar ? 'aside-shown' : ''}`}>
            <>
               <ChatHeader 
                  title={displayName} 
                  participants={participants}
                  isOnline={isOnline}
                  searchVisible={searchVisible}
                  onToggleSearch={toggleSearch}
                  onToggleSidebar={toggleChatSidebar}
               />

               <div className="tyn-chat-body">
                  <div className="tyn-chat-body-inner">
                     {hasMoreMessages && (
                        <div className="load-more-container">
                           <button
                              onClick={handleLoadMoreMessages}
                              disabled={isLoadingMore || isFetching}
                              className="load-more-button"
                           >
                              {isLoadingMore ? 'Đang tải...' : 'Tải thêm tin nhắn'}
                           </button>
                        </div>
                     )}

                     <MessageList messages={messages} currentUserId={currentUserId} />

                     <div ref={messagesEndRef} />
                  </div>
               </div>

               <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
            </>

            {showChatSidebar && (
              <div className="tyn-chat-content-aside show-aside" id="tynChatAside" data-simplebar="init">
                <div className="simplebar-wrapper" style={{ margin: 0 }}>
                  <div className="simplebar-height-auto-observer-wrapper">
                    <div className="simplebar-height-auto-observer"></div>
                  </div>
                  <div className="simplebar-mask">
                    <div className="simplebar-offset" style={{ right: 0, bottom: 0 }}>
                      <div className="simplebar-content-wrapper" tabIndex={0} role="region" aria-label="scrollable content" style={{ height: '100%', overflow: 'hidden scroll' }}>
                        <div className="simplebar-content" style={{ padding: 0 }}>
                          <div className="tyn-chat-cover">
                            <img src={partnerProfile?.coverImage || "images/cover/1.jpg"} alt="" />
                          </div>
                          <div className="tyn-media-group tyn-media-vr tyn-media-center mt-n4">
                            <div className="tyn-media tyn-size-xl border border-2 border-white">
                              <img src={partnerProfile?.avatar || "images/avatar/1.jpg"} alt="" />
                            </div>
                            <div className="tyn-media-col">
                              <div className="tyn-media-row">
                                <h6 className="name">{displayName}</h6>
                              </div>
                              <div className="tyn-media-row has-dot-sap">
                                <span className="meta">{isOnline ? 'Active Now' : 'Offline'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="tyn-aside-row">
                            <ul className="nav nav-btns nav-btns-stretch nav-btns-light" role="tablist">
                              <li className="nav-item" role="presentation">
                                <button className="nav-link js-chat-mute-toggle tyn-chat-mute" type="button" aria-selected="false" tabIndex={-1} role="tab">
                                  <span className="icon unmuted-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bell-fill" viewBox="0 0 16 16">
                                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"></path>
                                    </svg>
                                  </span>
                                  <span className="unmuted-icon">Mute</span>
                                  <span className="icon muted-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bell-slash-fill" viewBox="0 0 16 16">
                                      <path d="M5.164 14H15c-1.5-1-2-5.902-2-7q0-.396-.06-.776zm6.288-10.617A5 5 0 0 0 8.995 2.1a1 1 0 1 0-1.99 0A5 5 0 0 0 3 7c0 .898-.335 4.342-1.278 6.113zM10 15a2 2 0 1 1-4 0zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75z"></path>
                                    </svg>
                                  </span>
                                  <span className="muted-icon">Muted</span>
                                </button>
                              </li>
                              <li className="nav-item" role="presentation">
                                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-media" type="button" aria-selected="false" tabIndex={-1} role="tab">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-images" viewBox="0 0 16 16">
                                    <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"></path>
                                    <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"></path>
                                  </svg>
                                  <span>Media</span>
                                </button>
                              </li>
                              <li className="nav-item" role="presentation">
                                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-members" type="button" aria-selected="false" tabIndex={-1} role="tab">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people-fill" viewBox="0 0 16 16">
                                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                                  </svg>
                                  <span>Members</span>
                                </button>
                              </li>
                              <li className="nav-item" role="presentation">
                                <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#chat-options" type="button" aria-selected="true" role="tab">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sliders" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z"></path>
                                  </svg>
                                  <span>Options</span>
                                </button>
                              </li>
                            </ul>
                          </div>
                          <div className="tab-content">
                            <div className="tab-pane" id="chat-media" tabIndex={0} role="tabpanel">
                              <div className="tyn-aside-row py-0">
                                <ul className="nav nav-tabs nav-tabs-line" role="tablist">
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#chat-media-images" type="button" aria-selected="true" role="tab"> Images </button>
                                  </li>
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-media-videos" type="button" aria-selected="false" tabIndex={-1} role="tab"> Videos </button>
                                  </li>
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-media-files" type="button" aria-selected="false" tabIndex={-1} role="tab"> Files </button>
                                  </li>
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-media-links" type="button" aria-selected="false" tabIndex={-1} role="tab"> Links </button>
                                  </li>
                                </ul>
                              </div>
                              <div className="tyn-aside-row">
                                <div className="tab-content">
                                  <div className="tab-pane show active" id="chat-media-images" tabIndex={0} role="tabpanel">
                                    <div className="row g-3">
                                      <div className="col-4">
                                        <a href="images/gallery/chat/1.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <img src="images/gallery/chat/thumb-1.jpg" className="tyn-image" alt="" />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="images/gallery/chat/2.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <img src="images/gallery/chat/thumb-2.jpg" className="tyn-image" alt="" />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="images/gallery/chat/3.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <img src="images/gallery/chat/thumb-3.jpg" className="tyn-image" alt="" />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="images/gallery/chat/4.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <img src="images/gallery/chat/thumb-4.jpg" className="tyn-image" alt="" />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="images/gallery/chat/5.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <img src="images/gallery/chat/thumb-5.jpg" className="tyn-image" alt="" />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="images/gallery/chat/6.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <img src="images/gallery/chat/thumb-6.jpg" className="tyn-image" alt="" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="tab-pane" id="chat-media-videos" tabIndex={0} role="tabpanel">
                                    {/* Videos content */}
                                  </div>
                                  <div className="tab-pane" id="chat-media-files" tabIndex={0} role="tabpanel">
                                    {/* Files content */}
                                  </div>
                                  <div className="tab-pane" id="chat-media-links" tabIndex={0} role="tabpanel">
                                    {/* Links content */}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* New Members Tab */}
                            <div className="tab-pane" id="chat-members" tabIndex={0} role="tabpanel">
                              <div className="tyn-aside-row py-0">
                                <ul className="nav nav-tabs nav-tabs-line" role="tablist">
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#chat-group-members" type="button" aria-selected="true" role="tab">Group Members</button>
                                  </li>
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-add-members" type="button" aria-selected="false" tabIndex={-1} role="tab">Add Members</button>
                                  </li>
                                </ul>
                              </div>
                              <div className="tyn-aside-row">
                                <div className="tab-content">
                                  <div className="tab-pane show active" id="chat-group-members" tabIndex={0} role="tabpanel">
                                    <div className="tyn-media-list gap gap-3">
                                      {/* Example group members - would be replaced with actual data */}
                                      <li>
                                        <div className="tyn-media-group">
                                          <div className="tyn-media tyn-size-lg">
                                            <img src="images/avatar/1.jpg" alt="" />
                                          </div>
                                          <div className="tyn-media-col">
                                            <div className="tyn-media-row">
                                              <h6 className="name">Jane Cooper</h6>
                                            </div>
                                            <div className="tyn-media-row has-dot-sap">
                                              <span className="meta">Online</span>
                                            </div>
                                          </div>
                                          <div className="tyn-media-option">
                                            <ul className="tyn-media-option-list">
                                              <li>
                                                <button className="btn btn-icon btn-md btn-pill btn-light">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-dash" viewBox="0 0 16 16">
                                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                                    <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                                                  </svg>
                                                </button>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                      <li>
                                        <div className="tyn-media-group">
                                          <div className="tyn-media tyn-size-lg">
                                            <img src="images/avatar/2.jpg" alt="" />
                                          </div>
                                          <div className="tyn-media-col">
                                            <div className="tyn-media-row">
                                              <h6 className="name">Robert Fox</h6>
                                            </div>
                                            <div className="tyn-media-row has-dot-sap">
                                              <span className="meta">Offline</span>
                                            </div>
                                          </div>
                                          <div className="tyn-media-option">
                                            <ul className="tyn-media-option-list">
                                              <li>
                                                <button className="btn btn-icon btn-md btn-pill btn-light">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-dash" viewBox="0 0 16 16">
                                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                                    <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                                                  </svg>
                                                </button>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                      <li>
                                        <div className="tyn-media-group">
                                          <div className="tyn-media tyn-size-lg">
                                            <img src="images/avatar/3.jpg" alt="" />
                                          </div>
                                          <div className="tyn-media-col">
                                            <div className="tyn-media-row">
                                              <h6 className="name">Esther Howard</h6>
                                            </div>
                                            <div className="tyn-media-row has-dot-sap">
                                              <span className="meta">Online</span>
                                            </div>
                                          </div>
                                          <div className="tyn-media-option">
                                            <ul className="tyn-media-option-list">
                                              <li>
                                                <button className="btn btn-icon btn-md btn-pill btn-light">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-dash" viewBox="0 0 16 16">
                                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                                    <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                                                  </svg>
                                                </button>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                    </div>
                                  </div>
                                  <div className="tab-pane" id="chat-add-members" tabIndex={0} role="tabpanel">
                                    <div className="px-2 mb-3">
                                      <div className="form-group">
                                        <div className="form-control-wrap">
                                          <input type="text" className="form-control form-control-lg" placeholder="Search contacts..." />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="tyn-media-list gap gap-3">
                                      {/* Example contacts that can be added to the group */}
                                      <li>
                                        <div className="tyn-media-group">
                                          <div className="tyn-media tyn-size-lg">
                                            <img src="images/avatar/4.jpg" alt="" />
                                          </div>
                                          <div className="tyn-media-col">
                                            <div className="tyn-media-row">
                                              <h6 className="name">Leslie Alexander</h6>
                                            </div>
                                            <div className="tyn-media-row has-dot-sap">
                                              <span className="meta">Offline</span>
                                            </div>
                                          </div>
                                          <div className="tyn-media-option">
                                            <ul className="tyn-media-option-list">
                                              <li>
                                                <button className="btn btn-icon btn-md btn-pill btn-light">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                                                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                                                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                                                  </svg>
                                                </button>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                      <li>
                                        <div className="tyn-media-group">
                                          <div className="tyn-media tyn-size-lg">
                                            <img src="images/avatar/5.jpg" alt="" />
                                          </div>
                                          <div className="tyn-media-col">
                                            <div className="tyn-media-row">
                                              <h6 className="name">Dianne Russell</h6>
                                            </div>
                                            <div className="tyn-media-row has-dot-sap">
                                              <span className="meta">Online</span>
                                            </div>
                                          </div>
                                          <div className="tyn-media-option">
                                            <ul className="tyn-media-option-list">
                                              <li>
                                                <button className="btn btn-icon btn-md btn-pill btn-light">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                                                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                                                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                                                  </svg>
                                                </button>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                      <li>
                                        <div className="tyn-media-group">
                                          <div className="tyn-media tyn-size-lg">
                                            <img src="images/avatar/6.jpg" alt="" />
                                          </div>
                                          <div className="tyn-media-col">
                                            <div className="tyn-media-row">
                                              <h6 className="name">Theresa Webb</h6>
                                            </div>
                                            <div className="tyn-media-row has-dot-sap">
                                              <span className="meta">Online</span>
                                            </div>
                                          </div>
                                          <div className="tyn-media-option">
                                            <ul className="tyn-media-option-list">
                                              <li>
                                                <button className="btn btn-icon btn-md btn-pill btn-light">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                                                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                                                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                                                  </svg>
                                                </button>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                    </div>
                                    <div className="d-flex justify-content-center mt-3">
                                      <button className="btn btn-primary">Add Selected Members</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="tab-pane show active" id="chat-options" tabIndex={0} role="tabpanel">
                              <div className="tyn-aside-row py-0">
                                <ul className="nav nav-tabs nav-tabs-line" role="tablist">
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#chat-options-customize" type="button" aria-selected="true" role="tab"> Customize </button>
                                  </li>
                                  <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-options-manage" type="button" aria-selected="false" tabIndex={-1} role="tab"> Manage </button>
                                  </li>
                                </ul>
                              </div>
                              <div className="tyn-aside-row">
                                <div className="tab-content">
                                  <div className="tab-pane show active" id="chat-options-customize" tabIndex={0} role="tabpanel">
                                    <ul className="d-flex flex-column gap gap-4">
                                      <li>
                                        <h6 className="tyn-title-overline">Change Theme</h6>
                                        <ul className="tyn-chat-theme-list">
                                          <li>
                                            <button className="tyn-chat-theme-btn" data-theme="blue"></button>
                                          </li>
                                          <li>
                                            <button className="tyn-chat-theme-btn" data-theme="indigo"></button>
                                          </li>
                                          <li>
                                            <button className="tyn-chat-theme-btn" data-theme="green"></button>
                                          </li>
                                          <li>
                                            <button className="tyn-chat-theme-btn" data-theme="red"></button>
                                          </li>
                                        </ul>
                                      </li>
                                      <li>
                                        <h6 className="tyn-title-overline">Change Background</h6>
                                        <div className="row g-3">
                                          <div className="col-4">
                                            <button className="tyn-thumb">
                                              <img src="images/gallery/chat/thumb-1.jpg" className="tyn-image" alt="" />
                                            </button>
                                          </div>
                                          <div className="col-4">
                                            <button className="tyn-thumb">
                                              <img src="images/gallery/chat/thumb-2.jpg" className="tyn-image" alt="" />
                                            </button>
                                          </div>
                                          <div className="col-4">
                                            <button className="tyn-thumb">
                                              <img src="images/gallery/chat/thumb-3.jpg" className="tyn-image" alt="" />
                                            </button>
                                          </div>
                                        </div>
                                      </li>
                                      <li>
                                        <h6 className="tyn-title-overline">Edit Nicknames</h6>
                                        <ul className="tyn-media-list gap gap-3">
                                          <li>
                                            <div className="tyn-media-group">
                                              <div className="tyn-media tyn-size-lg">
                                                <img src={partnerProfile?.avatar || "images/avatar/1.jpg"} alt="" />
                                              </div>
                                              <div className="tyn-media-col">
                                                <div className="tyn-media-row">
                                                  <h6 className="name">{displayName}</h6>
                                                </div>
                                                <div className="tyn-media-row has-dot-sap">
                                                  <span className="meta">og : {partnerProfile?.username || otherUser?.username}</span>
                                                </div>
                                              </div>
                                              <div className="tyn-media-option">
                                                <ul className="tyn-media-option-list">
                                                  <li>
                                                    <button className="btn btn-icon btn-md btn-pill btn-light">
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"></path>
                                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"></path>
                                                      </svg>
                                                    </button>
                                                  </li>
                                                </ul>
                                              </div>
                                            </div>
                                          </li>
                                        </ul>
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="tab-pane" id="chat-options-manage" tabIndex={0} role="tabpanel">
                                    <ul className="tyn-media-list gap gap-3">
                                      {conversationType === 'GROUP' && (
                                        <li>
                                          <a href="#" className="tyn-file">
                                            <div className="tyn-media-group">
                                              <div className="tyn-media text-bg-danger">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                                                </svg>
                                              </div>
                                              <div className="tyn-media-col">
                                                <h6 className="name">Delete Group</h6>
                                                <div className="meta">This action cannot be undone. All conversations will be permanently deleted.</div>
                                              </div>
                                            </div>
                                          </a>
                                        </li>
                                      )}
                                      {conversationType === 'GROUP' && (
                                        <li>
                                          <a href="#" className="tyn-file">
                                            <div className="tyn-media-group">
                                              <div className="tyn-media text-bg-warning">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                                                  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                                  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                                                </svg>
                                              </div>
                                              <div className="tyn-media-col">
                                                <h6 className="name">Leave Group</h6>
                                                <div className="meta">You will no longer receive messages from this group.</div>
                                              </div>
                                            </div>
                                          </a>
                                        </li>
                                      )}
                                      <li>
                                        <a href="#" className="tyn-file">
                                          <div className="tyn-media-group">
                                            <div className="tyn-media text-bg-light">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-x-fill" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6.146-2.854a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708"></path>
                                              </svg>
                                            </div>
                                            <div className="tyn-media-col">
                                              <h6 className="name">Block</h6>
                                              <div className="meta">{displayName} will no longer be in your contact.</div>
                                            </div>
                                          </div>
                                        </a>
                                      </li>
                                      <li>
                                        <a href="#" className="tyn-file">
                                          <div className="tyn-media-group">
                                            <div className="tyn-media text-bg-light">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"></path>
                                              </svg>
                                            </div>
                                            <div className="tyn-media-col">
                                              <h6 className="name">Report</h6>
                                              <div className="meta">Give feedback on the conversation</div>
                                            </div>
                                          </div>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
         </div>
      </>
   );
}
