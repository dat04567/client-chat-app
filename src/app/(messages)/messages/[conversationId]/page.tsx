'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AddMembersModal, ChatHeader, ChatInput, ChatSidebar, MessageList } from '@/components';
import {
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useGetConversationsQuery,
  useGetConversationParticipantsQuery,
  conversationsApi,
  useInviteToConversationMutation,
  useRemoveMemberFromConversationMutation
} from '@/redux/services/conversationsApi';
import { useGetFriendsQuery } from '@/redux/services/usersApi';
import { useSocket } from '@/hooks/useSocket';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

// Định nghĩa các interface để làm rõ kiểu dữ liệu
interface Message {
  id?: string;
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  type: string;
  status: string;
  senderName?: string;
  isCurrentUserSender?: boolean;
  sender?: {
    id: string;
    username?: string;
    profile?: any;
  };
}

interface Participant {
  userId: string;
  isAdmin?: boolean;
  isCreator?: boolean;
  isOnline?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

// Các params chuẩn để truy vấn tin nhắn
const MESSAGE_QUERY_PARAMS = {
  limit: 20,
  refetchConfig: {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  }
};

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
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
   const [isInviting, setIsInviting] = useState(false);
   const [isInvitingMultiple, setIsInvitingMultiple] = useState(false);
   const [activeTab, setActiveTab] = useState('options');

   // Add inviteToConversation mutation
   const [inviteToConversation, { isLoading: isInvitingApi }] = useInviteToConversationMutation();

   // Add removeMember mutation
   const [removeMember, { isLoading: isRemoving }] = useRemoveMemberFromConversationMutation();

   // Fetch conversation participants data
   const {
      data: participantsData,
      isLoading: isLoadingParticipants,
      error: participantsError
   } = useGetConversationParticipantsQuery(conversationId as string, {
      refetchOnMountOrArgChange: true
   });

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
         limit: MESSAGE_QUERY_PARAMS.limit,
         lastEvaluatedMessageId,
      },
      MESSAGE_QUERY_PARAMS.refetchConfig
   );



   const { data: conversations = [], isLoading: isLoadingConversations } = useGetConversationsQuery(
      undefined,
      MESSAGE_QUERY_PARAMS.refetchConfig
   );

   const currentConversation = useMemo(
      () => conversations.find((c) => c.conversationId === conversationId),
      [conversations, conversationId]
   );
   
   const partnerProfile = currentConversation?.partner?.profile;

   const messages = useMemo(() => conversationData?.messages || [], [conversationData]);
   const otherUser = useMemo(() => conversationData?.otherUser || null, [conversationData]);
   const conversationType = useMemo(
      () => currentConversation?.type || 'ONE-TO-ONE',
      [currentConversation]
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
        console.log('New message received:', data);

        
        
          dispatch(
              conversationsApi.endpoints.getConversationMessages.initiate(
                {
                  conversationId: conversationId as string,
                  limit: MESSAGE_QUERY_PARAMS.limit,
                  lastEvaluatedMessageId: null,
                }, 
                { forceRefetch: true }
              )
            );
            // Scroll to bottom after new message
            if (messagesEndRef.current) {
              setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }, 100);
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
    (content) => {
      console.log('Sending content:', content);
      
      if (typeof content === 'string' && content.trim()) {
       // Handle text message
       const messageData: Message = {
        conversationId: conversationId as string,
        content: content.trim(),
        senderId: currentUserId,
        type: 'TEXT',
        createdAt: new Date().toISOString(),
        messageId: `temp-${Date.now()}`,
        status: 'SENDING',
        isCurrentUserSender: true,
        sender: {
          id: currentUserId,
        }
       };

       console.log('Sending text message data:', messageData);
       emit('send-message', messageData);
      } else if (typeof content === 'object' && content !== null) {
       const messageData: Message = {
        conversationId: conversationId as string,
        content: content.fileName,
        senderId: currentUserId,
        type: 'MEDIA',
        createdAt: new Date().toISOString(),
        messageId: `temp-${Date.now()}`,
        status: 'SENDING',
        isCurrentUserSender: true,
        sender: {
          id: currentUserId,
        }
       };

    
       emit('send-message', messageData);
      }
    },
    [conversationId, currentUserId, emit]
  );

   const handleInviteUser = useCallback((userId: string) => {
      setIsInviting(true);
      
      // Call the API to invite the user
      inviteToConversation({
         conversationId: conversationId as string,
         invitedUserId: userId
      })
      .unwrap()
      .then(() => {
         // On success, add user to selected list
         setSelectedUserIds((prev) => [...prev, userId]);
         toast.success('Đã mời thành công vào nhóm chat');
      })
      .catch((error) => {
         toast.error(error?.data?.message || 'Không thể mời người dùng này');
      })
      .finally(() => {
         setIsInviting(false);
      });
   }, [conversationId, inviteToConversation]);

   const handleInviteSelectedUsers = useCallback(() => {
      // This function will handle batch invitations one by one
      setIsInvitingMultiple(true);
      
      // Use Promise.all to send all invitations in parallel
      const invitePromises = selectedUserIds.map(userId => 
         inviteToConversation({
            conversationId: conversationId as string,
            invitedUserId: userId
         }).unwrap()
      );
      
      Promise.all(invitePromises)
         .then(() => {
            toast.success('Đã mời tất cả thành viên đã chọn vào nhóm chat');
            setSelectedUserIds([]);
         })
         .catch((error) => {
            toast.error('Có lỗi xảy ra khi mời một số thành viên');
         })
         .finally(() => {
            setIsInvitingMultiple(false);
         });
   }, [conversationId, selectedUserIds, inviteToConversation]);

   // Xử lý sự kiện khi admin xóa thành viên khỏi nhóm
  const handleRemoveMember = useCallback((userId: string) => {
  if (!conversationId) return;
  
  Swal.fire({
    title: 'Xác nhận',
    text: 'Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy'
  }).then((result) => {
    if (result.isConfirmed) {
      removeMember({
        conversationId: conversationId.toString(),
        userId
      })
      .unwrap()
      .then(() => {
        Swal.fire(
          'Đã xóa!',
          'Thành viên đã được xóa khỏi nhóm.',
          'success'
        );
      })
      .catch((error) => {
        Swal.fire(
          'Lỗi!',
          'Không thể xóa thành viên này.',
          'error'
        );
      });
    }
  });
}, [conversationId, removeMember]);

   // Get contacts for inviting to group chat
   const {
      data: contacts,
      isLoading: isLoadingContacts,
      error: errorContacts
   } = useGetFriendsQuery(searchQuery, {
      skip: searchQuery.length < 2 && selectedUserIds.length === 0
   });




   


   

   

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
      : otherUser?.username || 'Unknown User';   const participants = otherUser
      ? [{ id: otherUser.userId || otherUser.id || '1', name: otherUser.username || displayName }]
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
                            <Image 
                              src={partnerProfile?.coverImage || "/images/cover/1.jpg"} 
                              alt="Cover image" 
                              width={500}
                              height={200}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="tyn-media-group tyn-media-vr tyn-media-center mt-n4">
                            <div className="tyn-media tyn-size-xl border-white" style={{ border: '2px solid white' }}>
                              <Image 
                                src={partnerProfile?.avatar || "/images/avatar/1.jpg"} 
                                alt="Profile image"
                                width={80}
                                height={80}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                              />
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
                                    <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1H2.5A1.5 1.5 0 0 0 1 2.5z"></path>
                                  </svg>
                                  <span>Media</span>
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
                              {conversationType === 'GROUP' && (
                                <li className="nav-item add-members-tab" role="presentation">
                                  <button 
                                    className="nav-link" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#chat-add-members-tab" 
                                    id="add-members-tab-btn"
                                    type="button" 
                                    aria-selected="false" 
                                    tabIndex={-1} 
                                    role="tab"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                                      <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                                      <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                                    </svg>
                                    <span>Add</span>
                                  </button>
                                </li>
                              )}
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
                                        <a href="/images/gallery/chat/1.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <Image src="/images/gallery/chat/thumb-1.jpg" className="tyn-image" alt="Gallery image 1" width={80} height={60} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="/images/gallery/chat/2.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <Image src="/images/gallery/chat/thumb-2.jpg" className="tyn-image" alt="Gallery image 2" width={80} height={60} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="/images/gallery/chat/3.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <Image src="/images/gallery/chat/thumb-3.jpg" className="tyn-image" alt="Gallery image 3" width={80} height={60} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="/images/gallery/chat/4.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <Image src="/images/gallery/chat/thumb-4.jpg" className="tyn-image" alt="Gallery image 4" width={80} height={60} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="/images/gallery/chat/5.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <Image src="/images/gallery/chat/thumb-5.jpg" className="tyn-image" alt="Gallery image 5" width={80} height={60} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                        </a>
                                      </div>
                                      <div className="col-4">
                                        <a href="/images/gallery/chat/6.jpg" className="glightbox tyn-thumb" data-gallery="media-photo">
                                          <Image src="/images/gallery/chat/thumb-6.jpg" className="tyn-image" alt="Gallery image 6" width={80} height={60} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
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
                            
                            {/* Updated Group Members Tab */}
                   
                            
                            <div className="tab-pane" id="chat-add-members-tab" tabIndex={0} role="tabpanel">
                              <div className="px-2 mb-3">
                                <div className="form-group">
                                  <div className="form-control-wrap">
                                    <input 
                                      type="text" 
                                      className="form-control form-control-lg" 
                                      placeholder="Tìm kiếm liên hệ..." 
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="tyn-media-list gap gap-3">
                                {isLoadingContacts ? (
                                  <div className="d-flex justify-content-center my-3">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                  </div>
                                ) : errorContacts ? (
                                  <div className="text-center my-3 text-danger">
                                    <p>Lỗi khi tải danh sách liên hệ. Vui lòng thử lại.</p>
                                  </div>
                                ) : contacts && contacts.length > 0 ? (
                                  contacts.map((contact) => (
                                    <li key={contact.id}>
                                      <div className="tyn-media-group">
                                        <div className="tyn-media tyn-size-lg">
                                          <Image 
                                            src={contact?.profile?.avatar || "/images/avatar/default.png"} 
                                            alt="Contact avatar"
                                            width={48}
                                            height={48}
                                            className="tyn-image"
                                          />
                                        </div>
                                        <div className="tyn-media-col">
                                          <div className="tyn-media-row">
                                            <h6 className="name">{`${contact?.profile?.lastName || ''} ${contact?.profile?.firstName || ''}`}</h6>
                                          </div>
                                          <div className="tyn-media-row has-dot-sap">
                                            <span className="meta">{contact.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}</span>
                                          </div>
                                        </div>
                                        <div className="tyn-media-option">
                                          <ul className="tyn-media-option-list">
                                            <li>
                                              <button 
                                                className="btn btn-icon btn-md btn-pill btn-light"
                                                onClick={() => handleInviteUser(contact.id)}
                                                disabled={isInviting || selectedUserIds.includes(contact.id)}
                                              >
                                                {selectedUserIds.includes(contact.id) ? (
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
                                                  </svg>
                                                ) : (
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                                                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                                                    <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                                                  </svg>
                                                )}
                                              </button>
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                    </li>
                                  ))
                                ) : (
                                  <div className="text-center my-3">
                                    <p>Không tìm thấy liên hệ nào. Thử tìm kiếm khác.</p>
                                  </div>
                                )}
                              </div>
                              <div className="d-flex justify-content-center mt-3">
                                <button 
                                  className="btn btn-primary"
                                  onClick={handleInviteSelectedUsers}
                                  disabled={selectedUserIds.length === 0 || isInvitingMultiple}
                                >
                                  {isInvitingMultiple ? 'Đang thêm...' : 'Thêm thành viên đã chọn'}
                                </button>
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
                                   <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#chat-options-members" type="button" aria-selected="false" tabIndex={-1} role="tab"> Members </button>
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
                                              <Image 
                                                src="/images/gallery/chat/thumb-1.jpg" 
                                                className="tyn-image" 
                                                alt="Background option 1" 
                                                width={80}
                                                height={60}
                                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                              />
                                            </button>
                                          </div>
                                          <div className="col-4">
                                            <button className="tyn-thumb">
                                              <Image 
                                                src="/images/gallery/chat/thumb-2.jpg" 
                                                className="tyn-image" 
                                                alt="Background option 2" 
                                                width={80}
                                                height={60}
                                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                              />
                                            </button>
                                          </div>
                                          <div className="col-4">
                                            <button className="tyn-thumb">
                                              <Image 
                                                src="/images/gallery/chat/thumb-3.jpg" 
                                                className="tyn-image" 
                                                alt="Background option 3" 
                                                width={80}
                                                height={60}
                                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                              />
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
                                                <Image 
                                                  src={partnerProfile?.avatar || "/images/avatar/1.jpg"}
                                                  alt="User avatar"
                                                  width={48}
                                                  height={48}
                                                  className="tyn-image"
                                                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                />
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
                                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v-6a.5.5 0 0 1-.5-.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"></path>
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
                                                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
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
                                  <div className="tab-pane" id="chat-options-members" tabIndex={0} role="tabpanel">
                                    <ul className="tyn-media-list gap gap-3">
                                      {isLoadingParticipants ? (
                                        <div className="d-flex justify-content-center my-3">
                                          <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Đang tải...</span>
                                          </div>
                                        </div>
                                      ) : participantsError ? (
                                        <div className="text-center my-3 text-danger">
                                          <p>Lỗi khi tải danh sách thành viên. Vui lòng thử lại.</p>
                                        </div>
                                      ) : participantsData && participantsData.participants && participantsData.participants.length > 0 ? (                                        participantsData.participants.map((participant: Participant) => (
                                          <li key={participant.userId}>
                                            <div className="tyn-media-group">
                                                <div className="tyn-media tyn-size-lg">
                                                  <Image 
                                                    src={participant.profile?.avatar || "/images/avatar/default.png"} 
                                                    alt="User avatar"
                                                    width={48}
                                                    height={48}
                                                    className="tyn-image"
                                                    style={{ objectFit: 'cover' }}
       
                                                  />

                                                </div>
                                              <div className="tyn-media-col">    
                                                <div className="tyn-media-row">
                                                  
                                                  <h6 className="name">{`${participant.profile?.lastName || ''} ${participant.profile?.firstName || ''}`}</h6>
                                                 {(participant.userId === participantsData.currentUserId || participant.isAdmin || participant.isCreator) && (
      <span className="badge-indicator ms-2" data-bs-toggle="tooltip" title={
        `${participant.userId === participantsData.currentUserId ? 'Bạn ' : ''}
         ${participant.isAdmin ? '- Admin ' : ''}
         ${participant.isCreator ? '- Người tạo nhóm' : ''}`
      }>
        <i className="bi bi-info-circle-fill text-primary"></i>
      </span>
    )}
                                                </div>
                                                <div className="tyn-media-row has-dot-sap">
                                                  <span className="meta">{participant.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}</span>
                                                </div>
                                              </div>                                              
                                              {participantsData.participants?.some(p => p.isCreator && p.userId === participantsData.currentUserId) && 
                                               participant.userId !== participantsData.currentUserId && (
                                                <div className="tyn-media-option">
                                                  <ul className="tyn-media-option-list">
                                                    <li>
                                                      <button 
                                                        className="btn btn-icon btn-md btn-pill btn-light"
                                                        onClick={() => handleRemoveMember(participant.userId)}
                                                        disabled={isRemoving}
                                                        title="Xóa khỏi nhóm"
                                                      >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-dash" viewBox="0 0 16 16">
                                                          <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                                          <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                                                        </svg>
                                                      </button>
                                                    </li>
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          </li>
                                        ))
                                      ) : (
                                        <div className="text-center my-3">
                                          <p>Không có thành viên nào trong nhóm.</p>
                                        </div>
                                      )}
                                      {conversationType === 'GROUP' && (
                                        <div className="d-flex justify-content-center mt-4">
                                          <button 
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                              // Open the modal instead of switching tab
                                              const addMembersModal = document.getElementById('addMembersModal');
                                              // Use Bootstrap's modal method to show the modal
                                              if (typeof window !== 'undefined') {
                                                const bootstrap = (window as any).bootstrap;
                                                if (bootstrap && bootstrap.Modal) {
                                                  const modal = new bootstrap.Modal(addMembersModal);
                                                  modal.show();
                                                }
                                              }
                                            }}
                                            type="button"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus me-2" viewBox="0 0 16 16">
                                              <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                                              <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                                            </svg>
                                            Thêm thành viên
                                          </button>
                                        </div>
                                      )}
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
