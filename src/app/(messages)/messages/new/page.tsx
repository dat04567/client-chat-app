'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '../../layout/ChatLayout';
import { ChatHeader, ChatInput, ChatMain, ChatSidebar, MessageList, UserIcon } from '@/components';
import Image from 'next/image';
import { useSearchUsersQuery, useGetContactsQuery } from '@/redux/services/usersApi';
import { conversationsApi, useCreateOneToOneConversationMutation, useCreateGroupConversationMutation } from '@/redux/services/conversationsApi';
import { Conversation, User } from '@/redux/services/types';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
   return typeof error === 'object' && error !== null && 'status' in error;
}

export default function NewMessagePage() {
   const router = useRouter();
   const dispatch = useDispatch<AppDispatch>();
   const [searchTerm, setSearchTerm] = useState('');
   const [searchVisible, setSearchVisible] = useState(true);
   const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [isCreatingChat, setIsCreatingChat] = useState(false);
   const [newConversationId, setNewConversationId] = useState<string | null>(null);
   const [filteredResults, setFilteredResults] = useState<User[]>([]);
   const [contactResults, setContactResults] = useState<User[]>([]);
   const [otherUserResults, setOtherUserResults] = useState<User[]>([]);
   const [groupName, setGroupName] = useState<string>('');
   const [isGroupChat, setIsGroupChat] = useState<boolean>(false);

   // RTK Query hooks
   const {
      data: searchResults,
      isLoading: isSearching,
      error: errorSearchUser,
   } = useSearchUsersQuery(debouncedSearchTerm, {
      skip: debouncedSearchTerm.length < 2,
   });

   // Get contacts
   const {
      data: contactsResponse,
      isLoading: isLoadingContacts,
   } = useGetContactsQuery(debouncedSearchTerm, {
      skip: debouncedSearchTerm.length < 2,
   });

   // RTK Query mutations for conversations
   const [createOneToOneConversation, { 
      isLoading: isCreatingOneToOne,
      error: oneToOneError 
   }] = useCreateOneToOneConversationMutation();

   const [createGroupConversation, { 
      isLoading: isCreatingGroup,
      error: groupError 
   }] = useCreateGroupConversationMutation();

   // Extract the contacts data array from the response
   const contactsData = useMemo(() => {
      if (contactsResponse && contactsResponse.success && contactsResponse.data) {
         return contactsResponse.data;
      }
      return [];
   }, [contactsResponse]);

   console.log('Contacts data:', contactsData);

   // Effect to redirect to new conversation when created
   useEffect(() => {
      if (newConversationId) {
         console.log('Redirecting to new conversation:', newConversationId);
         router.replace(`/messages/${newConversationId}`);
      }
   }, [newConversationId, router]);

   // Tạo tiêu đề "Tin nhắn mới đến [tên người nhận]" với dấu phẩy giữa các tên
   const chatTitle = useMemo(() => {
      if (selectedUsers.length === 0) {
         return { id: 'new-temp-id', userName: 'Tin nhắn mới' };
      }

      if (isGroupChat && selectedUsers.length > 1) {
         // Tạo tên nhóm từ họ của các thành viên
         const groupName = selectedUsers
            .map(user => user.profile.lastName)
            .filter(lastName => lastName.trim() !== '') // Lọc bỏ họ rỗng
            .join(', ');
         
         return { id: 'new-temp-id', userName: `Nhóm: ${groupName || 'Nhóm chat mới'}` };
      }

      const names = selectedUsers
         .map((user) => `${user.profile.firstName} ${user.profile.lastName}`)
         .join(', ');

      return { id: 'new-temp-id', userName: `Tin nhắn mới đến ${names}` };
   }, [selectedUsers, isGroupChat]);

   // Effect for handling debounced search term
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearchTerm(searchTerm);
      }, 500); // 500ms delay

      return () => clearTimeout(timer);
   }, [searchTerm]);

   // Update filtered results when search results or contacts change
   useEffect(() => {
      if (searchResults && searchResults.length > 0) {
         // Filter out already selected users
         const filtered = searchResults.filter(
            (user) => !selectedUsers.some((selected) => selected.id === user.id)
         );
         setFilteredResults(filtered);

         // Separate contacts from other users
         if (contactsData && contactsData.length > 0) {
            // Find users that are in contacts - simple ID comparison to avoid deep recursion
            const contacts = filtered.filter((user) => {
               return contactsData.some((contact) => contact.id === user.id);
            });

            // Find users that are not in contacts - simple ID comparison to avoid deep recursion
            const others = filtered.filter((user) => {
               return !contactsData.some((contact) => contact.id === user.id);
            });

            setContactResults(contacts);
            setOtherUserResults(others);
         } else {
            // If no contacts data, all results go to other users
            setContactResults([]);
            setOtherUserResults(filtered);
         }
      } else {
         setFilteredResults([]);
         setContactResults([]);
         setOtherUserResults([]);
      }
   }, [searchResults, contactsData, selectedUsers]);

   // Handle search input changes
   const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      // Clear results if search term is too short
      if (value.length < 2) {
         setFilteredResults([]);
      }

      // Show/hide search results based on whether there's any input
      setSearchVisible(value.length > 0);
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

   // Toggle group chat mode
   const toggleGroupChat = useCallback(() => {
      setIsGroupChat((prev) => !prev);
      if (!isGroupChat && selectedUsers.length === 1) {
         // When switching to group mode with one user already selected, keep that user
         setGroupName('');
      } else if (isGroupChat) {
         // When switching back to individual mode with multiple users, keep only the first user
         if (selectedUsers.length > 1) {
            setSelectedUsers([selectedUsers[0]]);
         }
      }
   }, [isGroupChat, selectedUsers]);

   // Handle group name change
   const handleGroupNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setGroupName(e.target.value);
   }, []);

   // Handle starting a chat with selected users
   const handleStartChat = useCallback(
      async (message) => {
         if (selectedUsers.length === 0 || isCreatingChat) return;

         setErrorMessage(null);
         setIsCreatingChat(true);

         try {
            if (selectedUsers.length > 1) {
               // Cuộc trò chuyện nhóm - không cần modal, tạo trực tiếp qua API
               // Tạo tên nhóm từ họ của các thành viên
               const autoGroupName = selectedUsers
                  .map(user => user.profile.lastName)
                  .filter(lastName => lastName.trim() !== '') // Lọc bỏ họ rỗng
                  .join(', ');
               
               const finalGroupName = autoGroupName || 'Nhóm chat mới';
               const participantIds = selectedUsers.map(user => user.id);

               // Sử dụng RTK Query mutation thay vì socket
               const result = await createGroupConversation({
                  groupName: finalGroupName,
                  participantIds: participantIds
               }).unwrap();

               console.log(result);
               
               if (result && result.conversationId) {
                  // Lưu cuộc trò chuyện mới và chuyển hướng
                  setNewConversationId(result.conversationId);
               }
            } else {
               // Cuộc trò chuyện một-một
               const recipient = selectedUsers[0];

               // Sử dụng RTK Query mutation thay vì socket
               const result = await createOneToOneConversation({
                  recipientId: recipient.id,
                  content: message
               }).unwrap();

               console.log(result);

               if (result && result.conversation && result.conversation.conversationId) {
                  // Lưu cuộc trò chuyện mới và chuyển hướng
                  setNewConversationId(result.conversation.conversationId);
               }
            }
         } catch (error) {
            console.error('Error starting conversation:', error);
            setErrorMessage('Lỗi không xác định khi tạo cuộc trò chuyện');
            setIsCreatingChat(false);
         }
      },
      [selectedUsers, createOneToOneConversation, createGroupConversation]
   );

   // Đặt timeout để hiển thị thông báo nếu không nhận được phản hồi
   useEffect(() => {
      let timeoutId: NodeJS.Timeout | null = null;

      if (isCreatingChat) {
         timeoutId = setTimeout(() => {
            if (isCreatingChat && !newConversationId) {
               setErrorMessage('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
               setIsCreatingChat(false);
            }
         }, 10000);
      }

      return () => {
         if (timeoutId) clearTimeout(timeoutId);
      };
   }, [isCreatingChat, newConversationId]);

   // Hàm để hiển thị tên đầy đủ của người dùng
   const getFullName = useCallback((user: User) => {
      return `${user.profile.firstName} ${user.profile.lastName}`;
   }, []);

   return (
      <>
         <ChatSidebar newMessageChat={chatTitle} onDeleteNewChat={null} />

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
                                       src={'/images/avatar/default.png'} // user.profile.avatar ||
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
                     {isGroupChat && (
                        <div className="tyn-media-row mt-2">
                           <h6 className="name">Tên nhóm: </h6>
                           <input
                              type="text"
                              value={groupName}
                              onChange={handleGroupNameChange}
                              placeholder="Nhập tên nhóm..."
                              style={{
                                 background: 'transparent',
                                 border: '1px solid #e5e5e5',
                                 borderRadius: '4px',
                                 padding: '5px 10px',
                                 fontSize: '14px',
                                 width: '200px',
                              }}
                           />
                        </div>
                     )}
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

                  <button
                     onClick={toggleGroupChat}
                     className={`btn ${isGroupChat ? 'btn-primary' : 'btn-outline-primary'} btn-sm ml-2`}
                     style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                        padding: '4px 8px',
                     }}>
                     {isGroupChat ? 'Tắt chế độ nhóm' : 'Tạo nhóm chat'}
                  </button>

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
                        {contactResults.length > 0 && (
                           <>
                              <div className="tyn-search-category">
                                 <h6
                                    style={{
                                       padding: '10px 10px 5px',
                                       margin: 0,
                                       fontSize: '14px',
                                       color: '#6e6e6e',
                                       backgroundColor: '#f5f5f5',
                                       borderBottom: '1px solid #eee',
                                    }}>
                                    Danh bạ của bạn
                                 </h6>
                              </div>
                              <ul className="tyn-search-list" role="listbox">
                                 {contactResults.map((user) => (
                                    <li
                                       key={user.id}
                                       className="tyn-search-item"
                                       onClick={() => handleSelectUser(user)}>
                                       <div className="tyn-user-item">
                                          <div className="tyn-user-avatar">
                                             <Image
                                                src={'/images/avatar/default.png'} // user.profile.avatar ||
                                                alt={getFullName(user)}
                                                style={{
                                                   width: '36px',
                                                   height: '36px',
                                                   borderRadius: '50%',
                                                   objectFit: 'cover',
                                                }}
                                                width={36}
                                                height={36}
                                             />
                                          </div>
                                          <div className="tyn-user-info">
                                             <span className="tyn-user-name">{getFullName(user)}</span>
                                          </div>
                                       </div>
                                    </li>
                                 ))}
                              </ul>
                           </>
                        )}

                        {otherUserResults.length > 0 && (
                           <>
                              <div className="tyn-search-category">
                                 <h6
                                    style={{
                                       padding: '10px 10px 5px',
                                       margin: 0,
                                       fontSize: '14px',
                                       color: '#6e6e6e',
                                       backgroundColor: '#f5f5f5',
                                       borderBottom: '1px solid #eee',
                                    }}>
                                    Người dùng khác
                                 </h6>
                              </div>
                              <ul className="tyn-search-list" role="listbox">
                                 {otherUserResults.map((user) => (
                                    <li
                                       key={user.id}
                                       className="tyn-search-item"
                                       onClick={() => handleSelectUser(user)}>
                                       <div className="tyn-user-item">
                                          <div className="tyn-user-avatar">
                                             <Image
                                                src={'/images/avatar/default.png'} // user.profile.avatar ||
                                                alt={getFullName(user)}
                                                style={{
                                                   width: '36px',
                                                   height: '36px',
                                                   borderRadius: '50%',
                                                   objectFit: 'cover',
                                                }}
                                                width={36}
                                                height={36}
                                             />
                                          </div>
                                          <div className="tyn-user-info">
                                             <span className="tyn-user-name">{getFullName(user)}</span>
                                          </div>
                                       </div>
                                    </li>
                                 ))}
                              </ul>
                           </>
                        )}
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

            {(errorMessage || oneToOneError || groupError) && (
               <div className="alert alert-danger m-3" role="alert">
                  {errorMessage || 'Lỗi không xác định khi tạo cuộc trò chuyện'}
               </div>
            )}

            {selectedUsers.length > 0 && (
               <div className="tyn-chat-body js-scroll-to-end" id="tynChatBody">
                  <MessageList messages={[]} currentUserId="current-user" />
                  <ChatInput 
                     onSendMessage={handleStartChat} 
                     disabled={isCreatingChat || isCreatingOneToOne || isCreatingGroup}
                  />
               </div>
            )}
         </div>
      </>
   );
}
