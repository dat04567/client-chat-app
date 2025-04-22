'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  useGetSentFriendRequestsQuery, 
  useGetReceivedFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useGetFriendsQuery
} from '@/redux/services/apiSlice';
import { getErrorMessage } from '@/utils/errorHandlers';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  isFavorite: boolean;
  isBlocked: boolean;
  isNew: boolean;
}

interface FriendRequest {
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
}

interface SentRequest {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
  };
  sentAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'favorites' | 'blocked' | 'sent-requests' | 'invitations'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isMainShown, setIsMainShown] = useState(false);
  const [acceptSuccessMessage, setAcceptSuccessMessage] = useState<string | null>(null);
  const [acceptErrorMessage, setAcceptErrorMessage] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: sentFriendRequests,
    isLoading: isLoadingSentRequests,
    error: sentRequestsError
  } = useGetSentFriendRequestsQuery();

  const {
    data: receivedFriendRequests,
    isLoading: isLoadingReceivedRequests,
    error: receivedRequestsError
  } = useGetReceivedFriendRequestsQuery();

  const {
    data: friends,
    isLoading: isLoadingFriends,
    error: friendsError
  } = useGetFriendsQuery();

  // Mutation hook để chấp nhận lời mời kết bạn
  const [acceptFriendRequestMutation, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();

  // Cập nhật state sentRequests khi có dữ liệu từ API
  useEffect(() => {
    if (sentFriendRequests && sentFriendRequests.length > 0) {
      // Chuyển đổi định dạng dữ liệu từ API sang định dạng sử dụng trong component
      const formattedRequests: SentRequest[] = sentFriendRequests.map(request => ({
        id: request.userId,
        user: {
          id: request.userId,
          name: `${request.profile.firstName} ${request.profile.lastName}`.trim(),
          username: `@${request.profile.firstName.toLowerCase()}`,
          avatar: '/images/avatar/default.png',
          status: 'offline'
        },
        sentAt: request.createdAt,
        status: 'pending'
      }));
      
      setSentRequests(formattedRequests);
    }
  }, [sentFriendRequests]);

  // Cập nhật state receivedRequests khi có dữ liệu từ API
  useEffect(() => {
    if (receivedFriendRequests && receivedFriendRequests.length > 0) {
      // Chuyển đổi định dạng dữ liệu từ API sang định dạng sử dụng trong component
      const formattedRequests = receivedFriendRequests.map(request => ({
        userId: request.userId,
        profile: {
          firstName: request.profile.firstName,
          lastName: request.profile.lastName,
          phone: request.profile.phone
        },
        createdAt: request.createdAt
      }));
      
      setReceivedRequests(formattedRequests);
    }
  }, [receivedFriendRequests]);

  // Cập nhật state contacts khi có dữ liệu friends từ API
  useEffect(() => {
    if (friends && friends.length > 0) {
      // Chuyển đổi định dạng dữ liệu từ API sang định dạng sử dụng trong component
      const formattedContacts: Contact[] = friends.map(friend => ({
        id: friend.userId,
        name: `${friend.profile.firstName} ${friend.profile.lastName}`.trim(),
        username: `@${friend.profile.firstName.toLowerCase()}`,
        avatar: friend.profile.avatar || '/images/avatar/default.png',
        status: friend.profile.status || 'offline',
        isFavorite: false, // Có thể cập nhật sau nếu API hỗ trợ
        isBlocked: false,  // Có thể cập nhật sau nếu API hỗ trợ
        isNew: false       // Có thể cập nhật sau nếu API hỗ trợ
      }));
      
      setContacts(formattedContacts);
      
      // Set the first contact as selected by default if not already selected
      if (formattedContacts.length > 0 && !selectedContact) {
        setSelectedContact(formattedContacts[0]);
      }
    }
  }, [friends, selectedContact]);

  // Filter contacts based on active tab and search term
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          contact.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'new':
        return matchesSearch && contact.isNew;
      case 'favorites':
        return matchesSearch && contact.isFavorite;
      case 'blocked':
        return matchesSearch && contact.isBlocked;
      case 'sent-requests':
      case 'invitations':
        return false; // These tabs don't show contacts
      default:
        return matchesSearch;
    }
  });
  
  // Filter sent requests based on search term
  const filteredSentRequests = sentRequests.filter(request => 
    request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    request.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter received requests based on search term
  const filteredReceivedRequests = receivedRequests.filter(request => 
    request.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    request.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsMainShown(true);
  };

  const toggleMainView = () => {
    setIsMainShown(!isMainShown);
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      // Reset các thông báo trước đó
      setAcceptSuccessMessage(null);
      setAcceptErrorMessage(null);
      
      // Gọi API để chấp nhận lời mời kết bạn
      const response = await acceptFriendRequestMutation(requestId).unwrap();
      
      // Cập nhật UI - Xóa yêu cầu khỏi danh sách lời mời
      setReceivedRequests(prevRequests => 
        prevRequests.filter(request => request.userId !== requestId)
      );
      
      // Hiển thị thông báo thành công
      setAcceptSuccessMessage(response.message || 'Đã chấp nhận lời mời kết bạn');
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setAcceptSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi chấp nhận lời mời kết bạn:', error);
      
      // Hiển thị thông báo lỗi
      setAcceptErrorMessage(getErrorMessage(error) || 'Không thể chấp nhận lời mời kết bạn');
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setAcceptErrorMessage(null);
      }, 3000);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    // TODO: Implement API call to reject friend request
    // const response = await rejectFriendRequestAPI(requestId);
    // if (response.success) {
    //   // Update the UI
    // }
  };

  const cancelFriendRequest = async (requestId: string) => {
    // TODO: Implement API call to cancel friend request
    // const response = await cancelFriendRequestAPI(requestId);
    // if (response.success) {
    //   // Update the UI
    //   setSentRequests(prevRequests => 
    //     prevRequests.filter(request => request.id !== requestId)
    //   );
    // }
    
    // Tạm thời cập nhật UI
    setSentRequests(prevRequests => 
      prevRequests.filter(request => request.id !== requestId)
    );
  };

  return (
    <>
      {/* Hiển thị thông báo thành công/lỗi */}
      {acceptSuccessMessage && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
          {acceptSuccessMessage}
        </div>
      )}
      
      {acceptErrorMessage && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
          {acceptErrorMessage}
        </div>
      )}
      
      {/* Aside */}
      <div className="tyn-aside tyn-aside-base">
        <div className="tyn-aside-head">
          <div className="tyn-aside-head-text">
            <h3 className="tyn-aside-title tyn-title">Contacts</h3>
            <span className="tyn-subtext">{contacts.length} Contacts</span>
          </div>
          <div className="tyn-aside-head-tools">
            <ul className="tyn-list-inline gap gap-3">
              <li>
                <button className="btn btn-icon btn-light btn-md btn-pill" data-bs-toggle="modal" data-bs-target="#addContact">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="tyn-aside-row pt-0">
          <ul className="nav nav-tabs nav-tabs-line">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveTab('all')}
              >
                All 
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'new' ? 'active' : ''}`} 
                onClick={() => setActiveTab('new')}
              >
                New 
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`} 
                onClick={() => setActiveTab('favorites')}
              >
                Favorites 
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'invitations' ? 'active' : ''}`} 
                onClick={() => setActiveTab('invitations')}
              >
                Invitations
                {receivedRequests.length > 0 && (
                  <span className="badge bg-primary text-white rounded-pill ms-1">{receivedRequests.length}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'sent-requests' ? 'active' : ''}`} 
                onClick={() => setActiveTab('sent-requests')}
              >
                Sent
                {sentRequests.length > 0 && (
                  <span className="badge bg-secondary text-white rounded-pill ms-1">{sentRequests.length}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'blocked' ? 'active' : ''}`} 
                onClick={() => setActiveTab('blocked')}
              >
                Blocked 
              </button>
            </li>
          </ul>
        </div>
        
        <div className="tyn-aside-body" data-simplebar>
          <div className="tyn-aside-search">
            <div className="form-group tyn-pill">
              <div className="form-control-wrap">
                <div className="form-control-icon start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  className="form-control form-control-solid" 
                  id="search" 
                  placeholder="Search contact / chat"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="tab-content">
            {/* All contacts, new, favorites, and blocked tabs */}
            {(activeTab === 'all' || activeTab === 'new' || activeTab === 'favorites' || activeTab === 'blocked') && (
              <div className="tab-pane show active" id="contact-all" tabIndex={0} role="tabpanel">
                {isLoadingFriends ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : friendsError ? (
                  <div className="alert alert-danger m-3">
                    {getErrorMessage(friendsError)}
                  </div>
                ) : filteredContacts.length > 0 ? (
                  <ul className="tyn-aside-list">
                    {filteredContacts.map(contact => (
                      <li 
                        key={contact.id} 
                        className={`tyn-aside-item js-toggle-main ${selectedContact?.id === contact.id ? 'active' : ''}`}
                        onClick={() => handleContactClick(contact)}
                      >
                        <div className="tyn-media-group">
                          <div className="tyn-media tyn-size-lg">
                            <img src={contact.avatar} alt={contact.name} />
                            {contact.status === 'online' && (
                              <div className="tyn-media-status text-bg-success"></div>
                            )}
                          </div>
                          <div className="tyn-media-col">
                            <div className="tyn-media-row">
                              <h6 className="name">{contact.name}</h6>
                              {contact.isNew && (
                                <span className="badge text-bg-primary text-white rounded-pill">New</span>
                              )}
                            </div>
                            <div className="tyn-media-row">
                              <p className="content">{contact.username}</p>
                            </div>
                          </div>
                          <div className="tyn-media-option tyn-aside-item-option">
                            <ul className="tyn-media-option-list">
                              <li>
                                <button className="btn btn-icon btn-md btn-white btn-pill">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-text-fill" viewBox="0 0 16 16">
                                    <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                                  </svg>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3 d-flex justify-content-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-people text-muted" viewBox="0 0 16 16">
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                      </svg>
                    </div>
                    <h6 className="text-muted">No contacts found</h6>
                    <p className="text-muted small">You don't have any contacts in this category</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Friend requests received (invitations) */}
            {activeTab === 'invitations' && (
              <div className="tab-pane show active" id="contact-invitations" tabIndex={0} role="tabpanel">
                {isLoadingReceivedRequests ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : receivedRequestsError ? (
                  <div className="alert alert-danger m-3">
                    {getErrorMessage(receivedRequestsError)}
                  </div>
                ) : filteredReceivedRequests.length > 0 ? (
                  <ul className="tyn-aside-list">
                    {filteredReceivedRequests.map(request => (
                      <li key={request.userId} className="tyn-aside-item">
                        <div className="tyn-media-group">
                          <div className="tyn-media tyn-size-lg">
                            <img src="/images/avatar/default.png" alt={`${request.profile.firstName} ${request.profile.lastName}`} />
                            <div className="tyn-media-status text-bg-success"></div>
                          </div>
                          <div className="tyn-media-col">
                            <div className="tyn-media-row">
                              <span className="message"><strong>{`${request.profile.firstName} ${request.profile.lastName}`}</strong> Added You</span>
                            </div>
                            <div className="tyn-media-row has-dot-sap">
                              <span className="meta">{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="tyn-media-row">
                              <ul className="tyn-btn-inline gap gap-3 pt-1">
                                <li>
                                  <button 
                                    className="btn btn-md btn-primary"
                                    onClick={() => acceptFriendRequest(request.userId)}
                                    disabled={isAccepting}
                                  >
                                    {isAccepting ? (
                                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2-circle" viewBox="0 0 16 16">
                                        <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"></path>
                                        <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"></path>
                                      </svg>
                                    )}
                                    <span>Accept</span>
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="btn btn-md btn-light"
                                    onClick={() => rejectFriendRequest(request.userId)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path>
                                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"></path>
                                    </svg>
                                    <span>Reject</span>
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-people text-muted" viewBox="0 0 16 16">
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                      </svg>
                    </div>
                    <h6 className="text-muted">No friend invitations</h6>
                    <p className="text-muted small">When someone invites you, they'll appear here</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Sent friend requests */}
            {activeTab === 'sent-requests' && (
              <div className="tab-pane show active" id="contact-sent-requests" tabIndex={0} role="tabpanel">
                {isLoadingSentRequests ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : sentRequestsError ? (
                  <div className="alert alert-danger m-3">
                    {getErrorMessage(sentRequestsError)}
                  </div>
                ) : filteredSentRequests.length > 0 ? (
                  <ul className="tyn-aside-list">
                    {filteredSentRequests.map(request => (
                      <li key={request.id} className="tyn-aside-item">
                        <div className="tyn-media-group">
                          <div className="tyn-media tyn-size-lg">
                            <img src={request.user.avatar} alt={request.user.name} />
                            {request.user.status === 'online' && (
                              <div className="tyn-media-status text-bg-success"></div>
                            )}
                          </div>
                          <div className="tyn-media-col">
                            <div className="tyn-media-row">
                              <span className="message">Request sent to <strong>{request.user.name}</strong></span>
                              <span className="badge bg-secondary text-white rounded-pill">Pending</span>
                            </div>
                            <div className="tyn-media-row has-dot-sap">
                              <span className="meta">{new Date(request.sentAt).toLocaleDateString()}</span>
                            </div>
                            <div className="tyn-media-row">
                              <ul className="tyn-btn-inline gap gap-3 pt-1">
                                <li>
                                  <button 
                                    className="btn btn-md btn-light"
                                    onClick={() => cancelFriendRequest(request.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path>
                                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"></path>
                                    </svg>
                                    <span>Cancel Request</span>
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3 d-flex justify-content-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-person-plus text-muted" viewBox="0 0 16 16">
                        <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                        <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                      </svg>
                    </div>
                    <h6 className="text-muted">No pending requests</h6>
                    <p className="text-muted small">You haven't sent any friend requests</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content - Hiển thị thông tin chi tiết của contact khi được chọn */}
      {selectedContact && (
        <div className={`tyn-main tyn-content-inner ${isMainShown ? 'main-shown' : ''}`} id="tynMain" >
          <div className="container">
            <div className="tyn-profile">
              <ul className="tyn-list-inline d-md-none translate-middle position-absolute start-50 z-1">
                <li>
                  <button className="btn btn-icon btn-pill btn-white js-toggle-main" onClick={toggleMainView}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                  </button>
                </li>
              </ul>
              
              <div className="tyn-profile-head">
                <div className="tyn-profile-cover">
                  <img className="tyn-profile-cover-image" src="/images/cover/2.jpg" alt="" />
                </div>
                <div className="tyn-profile-info">
                  <div className="tyn-media-group align-items-start">
                    <div className="tyn-media tyn-media-bordered tyn-size-4xl tyn-profile-avatar">
                      <img src={selectedContact.avatar} alt={selectedContact.name} />
                      {selectedContact.status === 'online' && (
                        <div className="tyn-media-status text-bg-success"></div>
                      )}
                    </div>
                    <div className="tyn-media-col">
                      <h3 className="tyn-media-name">{selectedContact.name}</h3>
                      <div className="tyn-media-desc">
                        <p>Status: {selectedContact.status === 'online' ? 'Online' : selectedContact.status === 'away' ? 'Away' : 'Offline'}</p>
                        <p>Username: {selectedContact.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="tyn-profile-nav">
                <ul className="nav nav-tabs nav-tabs-line border-0">
                  <li className="nav-item">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-about" type="button">About</button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-contacts" type="button">Mutual Contacts</button>
                  </li>
                </ul>
                <ul className="tyn-list-inline gap gap-3 ms-auto me-n1">
                  <li>
                    <Link href={`/messages/new?userId=${selectedContact.id}`} className="btn btn-primary btn-md">
                      <span>Message</span>
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="tyn-profile-details">
                <div className="tab-content">
                  <div className="tab-pane show active" id="profile-about" tabIndex={0}>
                    <div className="row gy-4">
                      <div className="col-md-6 col-lg-8">
                        <div className="card h-100">
                          <div className="card-body">
                            <h5 className="card-title">About Me</h5>
                            <p className="card-text">
                              {/* Thông tin này sẽ được lấy từ API trong tương lai */}
                              No information available
                            </p>
                            <h6 className="mt-4">Contact Information</h6>
                            <ul className="list-group list-group-borderless">
                              <li className="list-group-item ps-0">
                                <span className="title">Email:</span>
                                <span className="text">{selectedContact.username.replace('@', '')}@example.com</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="card h-100">
                          <div className="card-body">
                            <h5 className="card-title">Basic Information</h5>
                            <ul className="list-group list-group-borderless">
                              <li className="list-group-item ps-0">
                                <span className="title">Status:</span>
                                <span className="text">
                                  {selectedContact.status === 'online' ? 'Active now' : 
                                   selectedContact.status === 'away' ? 'Away' : 'Offline'}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tab-pane" id="profile-contacts" tabIndex={0}>
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-people text-muted" viewBox="0 0 16 16">
                          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                        </svg>
                      </div>
                      <h6 className="text-muted">No mutual contacts</h6>
                      <p className="text-muted small">You don't have any mutual contacts with this user</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}