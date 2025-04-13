'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchUsersQuery, useGetContactsQuery } from '@/redux/services/apiSlice';
import Link from 'next/link';

const NewChatModal = () => {
   const [searchQuery, setSearchQuery] = useState('');
   const [searchMode, setSearchMode] = useState<'contacts' | 'all'>('contacts');

   // Sử dụng RTK Query hooks với skip option để kiểm soát khi nào query được gọi
   const {
      data: contacts,
      isLoading: isContactsLoading,
      error: contactsError,
   } = useGetContactsQuery(searchQuery, {
      // Chỉ gọi API khi ở chế độ contacts
      skip: searchMode !== 'contacts',
   });

   const {
      data: searchResults,
      isLoading: isSearchLoading,
      error: searchError,
   } = useSearchUsersQuery(searchQuery, {
      // Chỉ gọi API khi ở chế độ tìm kiếm và có query
      skip: searchMode !== 'all' || searchQuery.length < 2,
   });

   // Lấy dữ liệu và trạng thái dựa trên chế độ hiện tại
   const users = searchResults || [];
   const loading = searchMode === 'contacts' ? isContactsLoading : isSearchLoading;
   const error = searchMode === 'contacts' ? contactsError : searchError;

   return (
      <div className="modal fade" tabIndex={-1} id="newChat">
         <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0">
               <div className="modal-body p-4">
                  <h4 className="pb-2">Start a new chat</h4>

                  {/* Toggle between contacts and all users */}
                  <div className="btn-group w-100 mb-3">
                     <button
                        className={`btn ${
                           searchMode === 'contacts' ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                        onClick={() => setSearchMode('contacts')}>
                        My Contacts
                     </button>
                     <button
                        className={`btn ${
                           searchMode === 'all' ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                        onClick={() => setSearchMode('all')}>
                        Find Users
                     </button>
                  </div>

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
                           id="search-contact"
                           placeholder={
                              searchMode === 'contacts' ? 'Search contacts' : 'Find users by name'
                           }
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                  </div>

                  {/* Hiển thị trạng thái loading */}
                  {loading && (
                     <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                           <span className="visually-hidden">Loading...</span>
                        </div>
                     </div>
                  )}

                  {/* Hiển thị thông báo lỗi */}
                  {error && (
                     <div className="alert alert-danger mt-3">
                        {(error as any)?.data?.message || 'Đã xảy ra lỗi khi tìm kiếm'}
                     </div>
                  )}

                  {/* Danh sách người dùng */}
                  {!loading && !error && (
                     <ul className="tyn-media-list gap gap-3 pt-4">
                        {users &&
                           users.map((user) => (
                              <li key={user.id}>
                                 <div className="tyn-media-group">
                                    <div className="tyn-media">
                                       <div
                                          style={{
                                             position: 'relative',
                                             width: '40px',
                                             height: '40px',
                                          }}>
                                          <Image
                                             src={user.profile.avatar}
                                             alt={
                                                user.profile.lastName + ' ' + user.profile.firstName
                                             }
                                             style={{ objectFit: 'cover', borderRadius: '50%' }}
                                          />
                                       </div>
                                       {!user.isContact && (
                                          <div className="tyn-media-badge" title="Not in contacts">
                                             <em className="icon ni ni-user-add"></em>
                                          </div>
                                       )}
                                    </div>
                                    <div className="tyn-media-col">
                                       <div className="tyn-media-row">
                                          <h6 className="name">
                                             {user.profile.lastName + ' ' + user.profile.firstName}
                                          </h6>
                                          {/* {!user.isContact && (
                                             <span className="badge bg-light text-secondary ms-1">
                                                New
                                             </span>
                                          )} */}
                                       </div>
                                       <div className="tyn-media-row">
                                          <p className="content">{user.username}</p>
                                       </div>
                                    </div>

                                    <Link
                                       href={`/messages/new?userId=${user.id}`}
                                       className="flex align-items-center text-decoration-none gap-x-[5px] py-2 px-3 rounded-md transition-all duration-300 hover:bg-primary-light hover:text-primary-600 group"
                                       title="Start a new chat"
                                       data-bs-dismiss="modal">
                                       <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      fill="currentColor"
                                      className="bi bi-chat-left-text transition-all duration-300 group-hover:text-primary-600 group-hover:scale-110"
                                      viewBox="0 0 16 16">
                                      <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                                      <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                                       </svg>
                                       <span className="whitespace-nowrap text-[12px] font-medium transition-all duration-300 group-hover:text-primary-600 group-hover:font-semibold">Bắt đầu chat</span>
                                    </Link>
                                 </div>
                              </li>
                           ))}
                     </ul>
                  )}

                  {!loading && !error && (!users || users.length === 0) && (
                     <div className="text-center py-4">
                        <p className="text-muted">No users found matching your search</p>
                     </div>
                  )}
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
                     <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1-.708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                  </svg>
               </button>
            </div>
         </div>
      </div>
   );
};

export default NewChatModal;
