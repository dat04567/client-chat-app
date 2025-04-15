'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '../../layout/ChatLayout';
import { ChatHeader, ChatInput, ChatMain, ChatSidebar, MessageList, UserIcon } from '@/components';
import Image from 'next/image';
import { useSearchUsersQuery } from '@/redux/services/usersApi';
import { User } from '@/redux/services/types';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { cookies } from 'next/headers';

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
   return typeof error === 'object' && error !== null && 'status' in error;
}

export default function NewMessagePage() {
   const router = useRouter();
   const [searchTerm, setSearchTerm] = useState('');
   const [searchVisible, setSearchVisible] = useState(true);
   const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [isCreatingChat, setIsCreatingChat] = useState(false);

   // RTK Query hooks
   const {
      data: searchResults,
      isLoading: isSearching,
      error: errorSearchUser,
   } = useSearchUsersQuery(debouncedSearchTerm, {
      skip: debouncedSearchTerm.length < 2,
   });

   // Tạo tiêu đề "Tin nhắn mới đến [tên người nhận]" với dấu phẩy giữa các tên
   const chatTitle = useMemo(() => {
      if (selectedUsers.length === 0) {
         return { id: 'new-temp-id', userName: 'Tin nhắn mới' };
      }

      const names = selectedUsers.map(
         (user) => `${user.profile.firstName} ${user.profile.lastName}`
      );
      return {
         id: 'new-temp-id',
         userName: `Tin nhắn mới đến ${names.join(', ')}`,
      };
   }, [selectedUsers]);

   const [filteredResults, setFilteredResults] = useState<User[]>([]);

   // Debounce search để tránh gọi API quá nhiều
   useEffect(() => {
      const timer = setTimeout(() => {
         if (searchTerm.length >= 2) {
            setDebouncedSearchTerm(searchTerm);
         } else {
            setFilteredResults([]);
         }
      }, 300); // Giảm thời gian debounce xuống 300ms để UX tốt hơn nhưng vẫn tối ưu

      return () => clearTimeout(timer);
   }, [searchTerm]);

   // Cập nhật kết quả tìm kiếm khi nhận được dữ liệu từ API
   useEffect(() => {
      if (searchResults && searchTerm.length >= 2) {
         setFilteredResults(searchResults);
      }
   }, [searchResults, searchTerm]);

   // Handle the deletion of the new message chat
   const handleDeleteNewChat = useCallback(() => {
      router.push('/messages');
   }, [router]);

   // Handle search input change - sử dụng useCallback để tối ưu
   const handleSearchChange = useCallback((e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.trim() === '') {
         setFilteredResults([]);
      }
   }, []);

   // Handle selecting a user from the search results
   const handleSelectUser = useCallback(
      (user: User) => {
         if (!selectedUsers.some((selected) => selected.id === user.id)) {
            setSelectedUsers((prev) => [...prev, user]);
         }
         setSearchTerm('');
         setFilteredResults([]);
      },
      [selectedUsers]
   );

   // Handle removing a selected user
   const handleRemoveUser = useCallback((userId: string) => {
      setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
   }, []);

   // Handle starting a chat with selected users - sử dụng RTK Mutation
   const handleStartChat = useCallback(async (message) => {
      if (selectedUsers.length === 0 || isCreatingChat) return;

      setErrorMessage(null);
      setIsCreatingChat(true);

      try {
         // Chuẩn bị dữ liệu cho cuộc trò chuyện
         if (selectedUsers.length === 1) {
            // Cuộc trò chuyện một-một
            const recipient = selectedUsers[0];
            const initialMessage = message;

            // Using direct socket connection approach
            try {
               // Create a socket connection
               const socket = io('http://localhost:5000', {
                  transports: ['websocket'],
                  timeout: 20000,
                  withCredentials: true,
               });

               // Handle connection events
               socket.on('connect', () => {
                  console.log('Socket connected - Starting conversation');

                  // Emit the start_conversation event
                  socket.emit('start_conversation', {
                     recipientId: recipient.id,
                     content: initialMessage,
                     type: 'ONE-TO-ONE',
                  });
               });

               // Listen for conversation started event
               socket.on('conversation_started', (data) => {
                  console.log('Conversation started:', data);
                  // Redirect to the new conversation
                  router.push(`/messages/${data.conversationId}`);
                  // Cleanup socket connection after successful redirect
                  socket.disconnect();
               });

               // Listen for errors
               socket.on('error', (error) => {
                  console.error('Socket error:', error);
                  setErrorMessage(error.message || 'Failed to create conversation');
                  setIsCreatingChat(false);
                  socket.disconnect();
               });

               // Handle connection error
               socket.on('connect_error', (error) => {
                  console.error('Connection error:', error);
                  setErrorMessage('Connection error: ' + error.message);
                  setIsCreatingChat(false);
                  socket.disconnect();
               });

               // Set a timeout in case the server doesn't respond
               setTimeout(() => {
                  if (socket.connected) {
                     setErrorMessage('Server timeout - no response received');
                     setIsCreatingChat(false);
                     socket.disconnect();
                  }
               }, 10000);
            } catch (error) {
               console.error('Socket initialization error:', error);
               setErrorMessage('Failed to initialize socket connection');
               setIsCreatingChat(false);
            }
         } else {
            // Cuộc trò chuyện nhóm sẽ được thêm sau
            setErrorMessage('Tính năng chat nhóm đang được phát triển');
            setIsCreatingChat(false);
         }
      } catch (error) {
         console.error('Error starting conversation:', error);
         setErrorMessage('Lỗi không xác định khi tạo cuộc trò chuyện');
         setIsCreatingChat(false);
      }
   }, [selectedUsers, router, isCreatingChat]);

   // Hàm để hiển thị tên đầy đủ của người dùng
   const getFullName = useCallback((user: User) => {
      return `${user.profile.firstName} ${user.profile.lastName}`;
   }, []);




   return (
      <>
         <ChatSidebar newMessageChat={chatTitle} onDeleteNewChat={handleDeleteNewChat} />

         <div className="tyn-main tyn-chat-content" id="tynMain">
            <div className="tyn-chat-head">
               <div className="tyn-media-group">
                  <div className="tyn-media-col">
                     <div className="tyn-media-row">
                        <h6 className="name">Đến: </h6>
                        <div className="tyn-selected-users">
                           {selectedUsers.map((user) => (
                              <div key={user.id} className="tyn-selected-user">
                                 {user.profile.avatar ? (
                                    <Image
                                       src={user.profile.avatar || '/images/avatar/default.png'}
                                       alt={getFullName(user)}
                                       width="24"
                                       height="24"
                                       style={{ borderRadius: '50%', marginRight: '5px' }}
                                    />
                                 ) : (
                                    <UserIcon width="24" height="24" className="mx-1" />
                                 )}

                                 <span>{getFullName(user)}</span>
                                 <button
                                    onClick={() => handleRemoveUser(user.id)}
                                    style={{
                                       background: 'none',
                                       border: 'none',
                                       cursor: 'pointer',
                                       marginLeft: '5px',
                                       color: '#999',
                                    }}>
                                    &times;
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="tyn-list-inline gap gap-3 me-auto">
                  <input
                     className=""
                     type="search"
                     placeholder="Tìm kiếm người dùng..."
                     value={searchTerm}
                     onChange={handleSearchChange}
                     autoFocus
                     aria-label="Search for users"
                     style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        width: '200px',
                        fontSize: '15px',
                     }}
                  />

                  {isSearching && searchTerm.length >= 2 && (
                     <div className="tyn-search-results">
                        <p style={{ padding: '10px', textAlign: 'center' }}>Đang tìm kiếm...</p>
                     </div>
                  )}

                  {errorSearchUser && (
                     <div className="tyn-search-results">
                        <p style={{ padding: '10px', textAlign: 'center', color: 'red' }}>
                           {isFetchBaseQueryError(errorSearchUser) && 'data' in errorSearchUser
                              ? String(errorSearchUser.data)
                              : 'Lỗi tìm kiếm người dùng'}
                        </p>
                     </div>
                  )}

                  {filteredResults && filteredResults.length > 0 && (
                     <div className="tyn-search-results">
                        <ul className="tyn-search-list" role="listbox">
                           {filteredResults.map((user) => (
                              <li
                                 key={user.id}
                                 className="tyn-search-item"
                                 onClick={() => handleSelectUser(user)}>
                                 <div className="tyn-user-item">
                                    <div className="tyn-user-avatar">
                                       <img
                                          src={user.profile.avatar || '/images/avatar/default.png'}
                                          alt={getFullName(user)}
                                          style={{
                                             width: '36px',
                                             height: '36px',
                                             borderRadius: '50%',
                                             objectFit: 'cover',
                                          }}
                                       />
                                    </div>
                                    <div className="tyn-user-info">
                                       <span className="tyn-user-name">{getFullName(user)}</span>
                                    </div>
                                 </div>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  {searchTerm.length >= 2 &&
                     filteredResults &&
                     filteredResults.length === 0 &&
                     !isSearching &&
                     !errorSearchUser && (
                        <div className="tyn-search-results">
                           <p style={{ padding: '10px', textAlign: 'center' }}>
                              Không tìm thấy người dùng nào
                           </p>
                        </div>
                     )}
               </div>
            </div>

            {selectedUsers.length > 0 && (
               <div className="tyn-chat-body js-scroll-to-end" id="tynChatBody" >
                  <MessageList messages={null} />
                  <ChatInput onSendMessage={handleStartChat} />
               </div>
            )}
         </div>
      </>
   );
}
