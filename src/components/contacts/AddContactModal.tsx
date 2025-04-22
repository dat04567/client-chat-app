'use client';

import React, { useState, useEffect } from 'react';
import { useSearchUsersQuery, useSendFriendRequestMutation } from '@/redux/services/apiSlice';
import { getErrorMessage } from '@/utils/errorHandlers';

interface User {
   id: string;
   name: string;
   username: string;
   avatar?: string;
}

const AddContactModal = () => {
   const [searchQuery, setSearchQuery] = useState('');
   const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
   const [successMessage, setSuccessMessage] = useState('');
   const [requestingUserId, setRequestingUserId] = useState<string | null>(null);

   // Sử dụng debounce để tránh gọi API quá nhiều lần khi user đang gõ
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearchQuery(searchQuery);
      }, 500);

      return () => clearTimeout(timer);
   }, [searchQuery]);

   // RTK Query hooks
   const {
      data: searchResults,
      isLoading: isSearchLoading,
      error: searchError,
      isFetching,
   } = useSearchUsersQuery(debouncedSearchQuery, {
      // Chỉ gọi API khi searchQuery có giá trị
      skip: !debouncedSearchQuery,
   });

   const [sendFriendRequest, { isLoading: isSendingRequest, error: friendRequestError }] = useSendFriendRequestMutation();

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      // Reset success message when searching again
      setSuccessMessage('');
   };

   const handleSendFriendRequest = async (userId: string) => {
      try {
         setRequestingUserId(userId);
         const response = await sendFriendRequest(userId).unwrap();
         setSuccessMessage(response.message || 'Đã gửi lời mời kết bạn thành công!');
      } catch (error) {
         console.error('Failed to send friend request:', error);
      } finally {
         setRequestingUserId(null);
      }
   };

   

   return (
      <div className="modal fade" tabIndex={-1} id="addContact">
         <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0">
               <div className="modal-body p-4">
                  <h4 className="pb-2">Search by UserName</h4>
                  <div className="form-group">
                     <div className="form-control-wrap">
                        <div className="form-control-icon start">
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-search"
                              viewBox="0 0 16 16">
                              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                           </svg>
                        </div>
                        <input
                           type="text"
                           className="form-control form-control-solid"
                           id="search-username"
                           placeholder="Enter username"
                           value={searchQuery}
                           onChange={handleInputChange}
                        />
                     </div>
                  </div>
                  
                  {/* Hiển thị thông báo thành công */}
                  {successMessage && (
                     <div className="alert alert-success mt-3">
                        {successMessage}
                     </div>
                  )}

                  {/* Hiển thị lỗi khi gửi lời mời kết bạn */}
                  {friendRequestError && (
                     <div className="alert alert-danger mt-3">
                        {getErrorMessage(friendRequestError)}
                     </div>
                  )}

                  {/* Hiển thị trạng thái loading */}
                  {isSearchLoading && (
                     <div className="d-flex justify-content-center my-3">
                        <div className="spinner-border text-primary" role="status">
                           <span className="visually-hidden">Loading...</span>
                        </div>
                     </div>
                  )}

                  {/* Hiển thị lỗi khi tìm kiếm */}
                  {searchError && (
                     <div className="alert alert-danger mt-3">
                        {getErrorMessage(searchError)}
                     </div>
                  )}

                  {/* Hiển thị kết quả tìm kiếm */}
                  {searchResults && searchResults.length > 0 ? (
                     <ul className="tyn-media-list gap gap-3 pt-4">
                        {searchResults.map((user) => (
                           <li key={user.id}>
                              <div className="tyn-media-group">
                                 <div className="tyn-media">
                                    <img 
                                       src={user.avatar || "/images/avatar/default.png"} 
                                       alt={user.name} 
                                    />
                                 </div>
                                 <div className="tyn-media-col">
                                    <div className="tyn-media-row">
                                       <h6 className="name">{user.profile.lastName + ' ' + user.profile.firstName}</h6>
                                    </div>
                                    <div className="tyn-media-row">
                                       <p className="content">@{user.username}</p>
                                    </div>
                                 </div>
                                 <ul className="tyn-media-option-list me-n1">
                                    <li className="dropdown">
                                       <button 
                                          className="btn btn-icon btn-white btn-pill"
                                          onClick={() => handleSendFriendRequest(user.id)}
                                          disabled={isSendingRequest && requestingUserId === user.id}
                                       >
                                          {isSendingRequest && requestingUserId === user.id ? (
                                             <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                             </div>
                                          ) : (
                                             <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-person-plus-fill"
                                                viewBox="0 0 16 16">
                                                <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                                                <path
                                                   fillRule="evenodd"
                                                   d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"
                                                />
                                             </svg>
                                          )}
                                       </button>
                                    </li>
                                 </ul>
                              </div>
                           </li>
                        ))}
                     </ul>
                  ) : debouncedSearchQuery && !isSearchLoading ? (
                     <div className="alert alert-info mt-3">
                        No users found. Try a different search term.
                     </div>
                  ) : null}
               </div>
               <button
                  className="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3"
                  data-bs-dismiss="modal">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="16"
                     height="16"
                     fill="currentColor"
                     className="bi bi-x-lg"
                     viewBox="0 0 16 16">
                     <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                  </svg>
               </button>
            </div>
         </div>
      </div>
   );
};

export default AddContactModal;