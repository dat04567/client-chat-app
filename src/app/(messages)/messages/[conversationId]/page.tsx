'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChatHeader, ChatMain, ChatInput, ChatSidebar, MessageList } from '@/components';
import { fetchMessagesAction, sendMessageAction, deleteChatAction } from '@/app/actions/chats';

export default function ConversationPage() {
   const params = useParams();
   const router = useRouter();
   const { conversationId } = params;
   const [loading, setLoading] = useState(true);
   const [conversation, setConversation] = useState(null);
   const [messages, setMessages] = useState([]);
   const [error, setError] = useState(null);
   const [lastEvaluatedMessageId, setLastEvaluatedMessageId] = useState(null);
   const [hasMoreMessages, setHasMoreMessages] = useState(true);
   const [isLoadingMore, setIsLoadingMore] = useState(false);

   //  const socket = useSocket();
   const messagesEndRef = useRef(null);

   // Fetch messages for the conversation
   const fetchMessages = useCallback(
      async (loadMore = false) => {
         if (!conversationId) return;

         try {
            if (loadMore && !hasMoreMessages) return;

            if (loadMore) setIsLoadingMore(true);
            else setLoading(true);

            const response = await fetchMessagesAction(
               conversationId,
               20, // Limit per page
               loadMore ? lastEvaluatedMessageId : undefined
            );

            if (response.error) {
               throw new Error(response.error);
            }

            const { messages: newMessages, lastEvaluatedKey } = response;

            setMessages((prev) => (loadMore ? [...prev, ...newMessages] : newMessages));

            setLastEvaluatedMessageId(lastEvaluatedKey);
            setHasMoreMessages(!!lastEvaluatedKey);

            // Placeholder for conversation data - in a real app, you'd fetch this separately
            if (!conversation) {
               setConversation({
                  title: 'Cuộc trò chuyện',
                  participants: [{ id: '1', name: 'Người dùng' }],
               });
            }
         } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err.message || 'Không thể tải tin nhắn');
         } finally {
            setLoading(false);
            setIsLoadingMore(false);
         }
      },
      [conversationId, lastEvaluatedMessageId, hasMoreMessages, conversation]
   );

   // Initial fetch
   useEffect(() => {
      fetchMessages();
   }, [fetchMessages]);

   // Handle real-time message updates
   //  useEffect(() => {
   //     if (!socket || !conversationId) return;

   //     // Listen for new messages in this conversation
   //     const handleNewMessage = (newMessage) => {
   //        if (newMessage.conversationId === conversationId) {
   //           setMessages(prev => [newMessage, ...prev]);
   //           scrollToBottom();
   //        }
   //     };

   //     socket.on('newMessage', handleNewMessage);

   //     return () => {
   //        socket.off('newMessage', handleNewMessage);
   //     };
   //  }, [socket, conversationId]);

   // Scroll to bottom when messages change
   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   };

   useEffect(() => {
      if (!loading && messages.length > 0) {
         scrollToBottom();
      }
   }, [loading, messages]);

   // Handle loading more messages when scrolling up
   const handleLoadMore = useCallback(() => {
      if (!isLoadingMore && hasMoreMessages) {
         fetchMessages(true);
      }
   }, [fetchMessages, isLoadingMore, hasMoreMessages]);

   // Handle sending messages
   const handleSendMessage = useCallback(
      async (content) => {
         if (!content.trim() || !conversationId) return;

         try {
            const response = await sendMessageAction(conversationId, content);

            if (response.error) {
               throw new Error(response.error);
            }

            // The new message will be added via socket event
            // But we can add it optimistically here if needed
            // setMessages(prev => [response, ...prev]);
         } catch (err) {
            console.error('Error sending message:', err);
            // Show error notification to user
         }
      },
      [conversationId]
   );

   // Handle deleting conversation
   const handleDeleteConversation = useCallback(async () => {
      try {
         if (!conversationId) return;

         const response = await deleteChatAction(conversationId);

         if (response.error) {
            throw new Error(response.error);
         }

         router.push('/messages');
      } catch (err) {
         console.error('Error deleting conversation:', err);
         setError('Không thể xóa cuộc trò chuyện');
      }
   }, [conversationId, router]);

   if (loading) {
      return (
         <>
            <ChatSidebar />
            <div className="tyn-main tyn-chat-content">
               <div className="tyn-chat-body">
                  <div className="tyn-chat-body-inner">
                     <div className="centered-loading">
                        <p>Đang tải cuộc trò chuyện...</p>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }

   if (error) {
      return (
         <>
            <ChatSidebar />
            <div className="tyn-main tyn-chat-content">
               <div className="tyn-chat-body">
                  <div className="tyn-chat-body-inner">
                     <div className="centered-error">
                        <p>{error}</p>
                        <button onClick={() => router.push('/messages')}>
                           Quay lại danh sách tin nhắn
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }

   return (
      <>
         <ChatSidebar />
         <div className="tyn-main tyn-chat-content">
            {conversation && (
               <>
                  <ChatHeader
                     title={conversation.title}
                     participants={conversation.participants}
                     onDeleteChat={handleDeleteConversation}
                  />
                  {/*                   
                  <div className="tyn-chat-body">
                     <div className="tyn-chat-body-inner">
                        {hasMoreMessages && (
                           <div className="load-more-container">
                              <button 
                                 onClick={handleLoadMore}
                                 disabled={isLoadingMore}
                                 className="load-more-button"
                              >
                                 {isLoadingMore ? 'Đang tải...' : 'Tải thêm tin nhắn'}
                              </button>
                           </div>
                        )}
                        
                        <MessageList 
                           messages={messages} 
                           currentUserId="1" // This should come from your auth context
                        />
                        
                        <div ref={messagesEndRef} />
                     </div>
                  </div> */}
                  <div className="tyn-chat-body">
                     {/* <div className="tyn-chat-body-inner">
                        <MessageList
                           messages={messages}
                           currentUserId="1" // This should come from your auth context
                           onLoadMore={handleLoadMore}
                        />
                     </div> */}

                     <ChatInput onSendMessage={handleSendMessage} />
                  </div>
               </>
            )}
         </div>
      </>
   );
}
