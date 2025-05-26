'use client';

import React from 'react';

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

interface SentRequestsListProps {
  requests: SentRequest[];
  isLoading: boolean;
  error: any;
  onCancel: (requestId: string) => void;
}

const SentRequestsList: React.FC<SentRequestsListProps> = ({
  requests,
  isLoading,
  error,
  onCancel
}) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3 d-flex justify-content-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-person-plus text-muted" viewBox="0 0 16 16">
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
            <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
          </svg>
        </div>
        <h6 className="text-muted">No pending requests</h6>
        <p className="text-muted small">You haven&apos;t sent any friend requests</p>
      </div>
    );
  }

  return (
    <ul className="tyn-aside-list">
      {requests.map(request => (
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
                      onClick={() => onCancel(request.id)}
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
  );
};

export default SentRequestsList;
