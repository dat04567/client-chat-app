'use client';

import React from 'react';

interface FriendRequest {
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
}

interface ReceivedRequestsListProps {
  requests: FriendRequest[];
  isLoading: boolean;
  error: any;
  isAccepting: boolean;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const ReceivedRequestsList: React.FC<ReceivedRequestsListProps> = ({
  requests,
  isLoading,
  error,
  isAccepting,
  onAccept,
  onReject
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
        <div className="mb-3 d-flex justify-content-center ">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-people text-muted" viewBox="0 0 16 16">
            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
          </svg>
        </div>
        <h6 className="text-muted">No friend invitations</h6>
        <p className="text-muted small">When someone invites you, they&apos;ll appear here</p>
      </div>
    );
  }

  return (
    <ul className="tyn-aside-list">
      {requests.map(request => (
        <li key={request.userId} className="tyn-aside-item">
          <div className="tyn-media-group">
            <div className="tyn-media tyn-size-lg">
              {/* <img src="/images/avatar/default.png" alt={`${request.profile.firstName} ${request.profile.lastName}`} /> */}
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
                      onClick={() => onAccept(request.userId)}
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
                      onClick={() => onReject(request.userId)}
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
  );
};

export default ReceivedRequestsList;
