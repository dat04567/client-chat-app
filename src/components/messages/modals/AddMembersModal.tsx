"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useGetFriendsQuery } from '@/redux/services/usersApi';
import { useInviteToConversationMutation } from '@/redux/services/conversationsApi';
import { User } from '@/redux/services/types';

interface AddMembersModalProps {
  conversationId: string;
  onAddMembers?: (members: string[]) => void;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({ conversationId, onAddMembers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  // Use RTK Query to fetch contacts
  const { data: contacts, isLoading, error: fetchError } = useGetFriendsQuery();
  


  
  // Use RTK Query to invite users to conversation
  const [inviteToConversation, { isLoading: isInviting }] = useInviteToConversationMutation();

  // Filter contacts if they're available
  const filteredContacts = contacts ? contacts.filter(contact =>
    contact.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  // Handle adding members
  const handleAddMembers = async () => {
    if (selectedContacts.length === 0 || !conversationId) return;
    
    try {
      // Loop through selected contacts and invite each user
      for (const userId of selectedContacts) {
        await inviteToConversation({
          conversationId,
          invitedUserId: userId
        }).unwrap();
      }
      
      // Close modal and execute callback
      if (onAddMembers) {
        onAddMembers(selectedContacts);
      }
      
      // Close modal using Bootstrap
      if (typeof window !== 'undefined') {
        const modalElement = document.getElementById('addMembersModal');
        if (modalElement) {
          // Use data-bs-dismiss attribute for Bootstrap 5
          const closeButton = document.querySelector('[data-bs-dismiss="modal"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          } else {
            // Fallback method if needed
            // Type assertion to avoid TypeScript errors
            const bootstrap = (window as any).bootstrap;
            if (bootstrap && bootstrap.Modal) {
              const bsModal = bootstrap.Modal.getInstance(modalElement);
              if (bsModal) {
                bsModal.hide();
              }
            }
          }
        }
      }
      
      // Reset selected contacts
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error adding members:', err);
      alert('Failed to add members. Please try again.');
    }
  };

  return (
    <div className="modal fade" id="addMembersModal" tabIndex={-1} aria-labelledby="addMembersModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="addMembersModalLabel">Thêm Thành Viên</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
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
              {isLoading ? (
                <div className="d-flex justify-content-center my-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : fetchError ? (
                <div className="text-center my-3 text-danger">
                  <p>Lỗi khi tải danh sách liên hệ. Vui lòng thử lại.</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center my-3">
                  <p>Không tìm thấy liên hệ nào.</p>
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`tyn-media-group p-2 rounded ${selectedContacts.includes(contact.id) ? 'bg-light' : ''}`}
                    role="button"
                    onClick={() => toggleContactSelection(contact.id)}
                  >
                    <div className="tyn-media tyn-size-lg">
                      <Image 
                        src={contact.profile?.avatar || "/images/avatar/1.jpg"} 
                        alt={`${contact.profile?.firstName || ''} ${contact.profile?.lastName || ''}`}
                        width={48}
                        height={48}
                        className="rounded-circle"
                      />
                      {selectedContacts.includes(contact.id) && (
                        <div className="tyn-media-status bg-success">
                          <em className="icon ni ni-check"></em>
                        </div>
                      )}
                    </div>
                     <div className="tyn-media-col">
                        <div className="tyn-media-row">
                           <h6 className="name">{`${contact.profile?.firstName || ''} ${contact.profile?.lastName || ''}`}</h6>
                        </div>
                        <div className="tyn-media-row">
                           <p className="content">{contact.profile?.email || ''}</p>
                        </div>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button 
              type="button" 
              className="btn btn-primary"
              disabled={selectedContacts.length === 0 || isLoading || isInviting}
              onClick={handleAddMembers}
            >
              {isInviting ? 'Đang thêm...' : `Thêm ${selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal;
