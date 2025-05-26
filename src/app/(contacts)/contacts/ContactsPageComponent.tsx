'use client';

import React, { useState, useEffect } from 'react';
import { 
  useGetSentFriendRequestsQuery, 
  useGetReceivedFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useGetFriendsQuery
} from '@/redux/services/apiSlice';
import { getErrorMessage } from '@/utils/errorHandlers';
import useDebounce from '@/hooks/useDebounce';
import {
  ContactsHeader,
  ContactsTabs,
  ContactsSearch,
  ContactList,
  ReceivedRequestsList,
  SentRequestsList,
  ContactProfile,
  Notification
} from '@/components/contacts';

// Define types
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

interface ContactsPageProps {
  defaultTab?: 'all' | 'new' | 'favorites' | 'blocked' | 'sent-requests' | 'invitations';
}

export default function ContactsPageComponent({ defaultTab = 'all' }: ContactsPageProps) {
  // State
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'favorites' | 'blocked' | 'sent-requests' | 'invitations'>(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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

  // Mutation hook
  const [acceptFriendRequestMutation, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();

  // Set the default tab when the component mounts or when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  
  // Listen for pathname changes to keep activeTab state in sync with URL
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path.includes('/contacts/')) {
        const segments = path.split('/');
        const lastSegment = segments[segments.length - 1];
        if (['all', 'new', 'favorites', 'blocked', 'invitations', 'sent-requests'].includes(lastSegment)) {
          setActiveTab(lastSegment as any);
        }
      }
    };

    // Set initial state based on URL
    handleRouteChange();

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Process sent requests data
  useEffect(() => {
    if (sentFriendRequests && sentFriendRequests.length > 0) {
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

  // Process received requests data
  useEffect(() => {
    if (receivedFriendRequests && receivedFriendRequests.length > 0) {
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

  // Process friends data
  useEffect(() => {
    if (friends && friends.length > 0) {
      const formattedContacts: Contact[] = friends.map(friend => ({
        id: friend.userId,
        name: `${friend.profile.firstName} ${friend.profile.lastName}`.trim(),
        username: `@${friend.profile.firstName.toLowerCase()}`,
        avatar: friend.profile.avatar || '/images/avatar/default.png',
        status: friend.profile.status || 'offline',
        isFavorite: false,
        isBlocked: false,
        isNew: false
      }));
      
      setContacts(formattedContacts);
      
      // Set the first contact as selected by default if not already selected
      if (formattedContacts.length > 0 && !selectedContact) {
        setSelectedContact(formattedContacts[0]);
      }
    }
  }, [friends, selectedContact]);

  // Memoize filtered contacts for performance optimization
  const filteredContacts = React.useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                           contact.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
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
  }, [contacts, debouncedSearchTerm, activeTab]);
  
  // Memoize filtered sent requests
  const filteredSentRequests = React.useMemo(() => {
    return sentRequests.filter(request => 
      request.user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
      request.user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [sentRequests, debouncedSearchTerm]);

  // Memoize filtered received requests
  const filteredReceivedRequests = React.useMemo(() => {
    return receivedRequests.filter(request => 
      request.profile.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
      request.profile.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [receivedRequests, debouncedSearchTerm]);

  // Event handlers
  const handleContactClick = React.useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsMainShown(true);
  }, []);

  const toggleMainView = React.useCallback(() => {
    setIsMainShown(prev => !prev);
  }, []);

  const handleAcceptFriendRequest = React.useCallback(async (requestId: string) => {
    try {
      // Reset messages
      setAcceptSuccessMessage(null);
      setAcceptErrorMessage(null);
      
      // Call API
      const response = await acceptFriendRequestMutation(requestId).unwrap();
      
      // Update UI
      setReceivedRequests(prevRequests => 
        prevRequests.filter(request => request.userId !== requestId)
      );
      
      // Show success message
      setAcceptSuccessMessage(response.message || 'Friend request accepted');
      
      // Hide after 3 seconds
      setTimeout(() => {
        setAcceptSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      
      // Show error message
      setAcceptErrorMessage(getErrorMessage(error) || 'Failed to accept friend request');
      
      // Hide after 3 seconds
      setTimeout(() => {
        setAcceptErrorMessage(null);
      }, 3000);
    }
  }, [acceptFriendRequestMutation]);

  const handleRejectFriendRequest = React.useCallback(async (requestId: string) => {
    // TODO: Implement API call to reject friend request
    console.log('Reject friend request:', requestId);
  }, []);

  const handleCancelFriendRequest = React.useCallback(async (requestId: string) => {
    // TODO: Implement API call to cancel friend request
    console.log('Cancel friend request:', requestId);
    
    // Update UI for now
    setSentRequests(prevRequests => 
      prevRequests.filter(request => request.id !== requestId)
    );
  }, []);

  return (
    <>
      {/* Notification component */}
      <Notification 
        success={acceptSuccessMessage} 
        error={acceptErrorMessage} 
      />
      
      {/* Aside section */}
      <div className="tyn-aside tyn-aside-base">
        {/* Header component */}
        <ContactsHeader contactCount={contacts.length} />
        
        {/* Tabs component */}
        <ContactsTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          receivedRequestsCount={receivedRequests.length} 
          sentRequestsCount={sentRequests.length} 
        />
        
        {/* Search and content */}
        <div className="tyn-aside-body" data-simplebar>
          {/* Search component */}
          <ContactsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          {/* Tab content */}
          <div className="tab-content">
            {/* All contacts, new, favorites, and blocked tabs */}
            {(activeTab === 'all' || activeTab === 'new' || activeTab === 'favorites' || activeTab === 'blocked') && (
              <div className="tab-pane show active" id="contact-all" tabIndex={0} role="tabpanel">
                <ContactList 
                  contacts={filteredContacts}
                  isLoading={isLoadingFriends}
                  error={friendsError ? getErrorMessage(friendsError) : null}
                  selectedContact={selectedContact}
                  onContactClick={handleContactClick}
                />
              </div>
            )}
            
            {/* Friend requests received (invitations) */}
            {activeTab === 'invitations' && (
              <div className="tab-pane show active" id="contact-invitations" tabIndex={0} role="tabpanel">
                <ReceivedRequestsList 
                  requests={filteredReceivedRequests}
                  isLoading={isLoadingReceivedRequests}
                  error={receivedRequestsError ? getErrorMessage(receivedRequestsError) : null}
                  isAccepting={isAccepting}
                  onAccept={handleAcceptFriendRequest}
                  onReject={handleRejectFriendRequest}
                />
              </div>
            )}
            
            {/* Sent friend requests */}
            {activeTab === 'sent-requests' && (
              <div className="tab-pane show active" id="contact-sent-requests" tabIndex={0} role="tabpanel">
                <SentRequestsList 
                  requests={filteredSentRequests}
                  isLoading={isLoadingSentRequests}
                  error={sentRequestsError ? getErrorMessage(sentRequestsError) : null}
                  onCancel={handleCancelFriendRequest}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact profile component */}
      {selectedContact && (
        <ContactProfile
          contact={selectedContact}
          isMainShown={isMainShown}
          toggleMainView={toggleMainView}
        />
      )}
    </>
  );
}
