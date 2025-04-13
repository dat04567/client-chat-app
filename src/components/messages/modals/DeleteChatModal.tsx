"use client";

import React from 'react';

const DeleteChatModal = () => {
  return (
    <div className="modal fade" tabIndex={-1} id="deleteChat">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">Delete Conversation</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
          </div>
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" className="btn btn-sm btn-danger" data-bs-dismiss="modal">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;