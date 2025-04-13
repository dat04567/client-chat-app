"use client";

import React from 'react';
import Image from 'next/image';

const ChatHeader = ({ chat, onToggleSearch, onToggleOptions, searchVisible, isNewChat = false }) => {
  // Default props for when no chat is selected
  const defaultName = "Select a conversation";
  const defaultStatus = "";
  const defaultAvatar = "/images/avatar/default.jpg";

  return (
    <div className="tyn-chat-head">
      <ul className="tyn-list-inline d-md-none ms-n1">
        <li>
          <button className="btn btn-icon btn-md btn-pill btn-transparent js-toggle-main">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </button>
        </li>
      </ul>
      
      <div className="tyn-media-group">
        <div className="tyn-media tyn-size-lg d-none d-sm-inline-flex">
          <div style={{ position: 'relative', width: '48px', height: '48px' }}>
            <Image 
              src={chat?.userAvatar || defaultAvatar} 
              alt={chat?.userName || defaultName}
              fill
              style={{ objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        </div>
        <div className="tyn-media tyn-size-rg d-sm-none">
          <div style={{ position: 'relative', width: '32px', height: '32px' }}>
            <Image 
              src={chat?.userAvatar || defaultAvatar} 
              alt={chat?.userName || defaultName}
              fill
              style={{ objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        </div>
        <div className="tyn-media-col">
          <div className="tyn-media-row">
            <h6 className="name">{chat?.userName || defaultName}</h6>
          </div>
          <div className="tyn-media-row has-dot-sap">
            <span className="meta">
              {isNewChat ? 'New Conversation' : chat?.isOnline ? 'Active' : chat?.status || defaultStatus}
            </span>
          </div>
        </div>
      </div>
      
      <ul className="tyn-list-inline gap gap-3 ms-auto">
        {chat && !isNewChat && (
          <>
            <li>
              <button className="btn btn-icon btn-light" data-bs-toggle="modal" data-bs-target="#callingScreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-fill" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                </svg>
              </button>
            </li>
            <li>
              <button className="btn btn-icon btn-light" data-bs-toggle="modal" data-bs-target="#videoCallingScreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera-video-fill" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
                </svg>
              </button>
            </li>
          </>
        )}
        <li className="d-none d-sm-block">
          <button className="btn btn-icon btn-light js-toggle-chat-search" onClick={onToggleSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
        </li>
        <li>
          <button className="btn btn-icon btn-light js-toggle-chat-options" onClick={onToggleOptions}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-layout-sidebar-inset-reverse" viewBox="0 0 16 16">
              <path d="M2 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h12z"/>
              <path d="M13 4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4z"/>
            </svg>
          </button>
        </li>
      </ul>
      
      {searchVisible && (
        <div className="tyn-chat-search" id="tynChatSearch">
          <div className="flex-grow-1">
            <div className="form-group">
              <div className="form-control-wrap form-control-plaintext-wrap">
                <input type="text" className="form-control-plaintext" id="searchChat" placeholder="Search in conversation" />
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap gap-3">
            <ul className="tyn-list-inline">
              <li>
                <button className="btn btn-sm btn-icon btn-transparent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                  </svg>
                </button>
              </li>
              <li>
                <button className="btn btn-sm btn-icon btn-transparent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </li>
            </ul>
            <ul className="tyn-list-inline">
              <li>
                <button className="btn btn-sm btn-icon btn-transparent" onClick={onToggleSearch}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1-.708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;