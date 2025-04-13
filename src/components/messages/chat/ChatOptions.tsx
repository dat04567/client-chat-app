"use client";

import React, { useState } from 'react';

const ChatOptions = ({ chat }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('options');
  
  return (
    <div className="tyn-chat-content-aside" id="tynChatAside" data-simplebar>
      <div className="tyn-chat-cover">
        <img src="/images/cover/1.jpg" alt="Cover" />
      </div>
      
      <div className="tyn-media-group tyn-media-vr tyn-media-center mt-n4">
        <div className="tyn-media tyn-size-xl border border-2 border-white">
          <img src={chat?.avatar || "/images/avatar/1.jpg"} alt={chat?.name || "User"} />
        </div>
        <div className="tyn-media-col">
          <div className="tyn-media-row">
            <h6 className="name">{chat?.name || "User Name"}</h6>
          </div>
          <div className="tyn-media-row has-dot-sap">
            <span className="meta">{chat?.active ? "Active Now" : "Offline"}</span>
          </div>
        </div>
      </div>
      
      <div className="tyn-aside-row">
        <ul className="nav nav-btns nav-btns-stretch nav-btns-light">
          <li className="nav-item">
            <button 
              className={`nav-link js-chat-mute-toggle tyn-chat-mute ${isMuted ? 'active' : ''}`}
              type="button"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bell-slash-fill" viewBox="0 0 16 16">
                  <path d="M5.164 14H15c-1.5-1-2-5.902-2-7 0-.264-.02-.523-.06-.776L5.164 14zm6.288-10.617A4.988 4.988 0 0 0 8.995 2.1a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 7c0 .898-.335 4.342-1.278 6.113l9.73-9.73zM10 15a2 2 0 1 1-4 0h4zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75L.625 15.625z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bell-fill" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                </svg>
              )}
              <span>Mute</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'media' ? 'active' : ''}`}
              data-bs-toggle="tab" 
              data-bs-target="#chat-media" 
              type="button"
              onClick={() => setActiveTab('media')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-images" viewBox="0 0 16 16">
                <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
              </svg>
              <span>Media</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'options' ? 'active' : ''}`}
              data-bs-toggle="tab" 
              data-bs-target="#chat-options" 
              type="button"
              onClick={() => setActiveTab('options')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
              </svg>
              <span>Options</span>
            </button>
          </li>
        </ul>
      </div>
      
      <div className="tab-content">
        <div className={`tab-pane ${activeTab === 'media' ? 'show active' : ''}`} id="chat-media" tabIndex={0}>
          <div className="tyn-aside-row py-0">
            <ul className="nav nav-tabs nav-tabs-line">
              <li className="nav-item">
                <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#photos-tab">Photos</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#videos-tab">Videos</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#files-tab">Files</button>
              </li>
            </ul>
          </div>
          
          <div className="tyn-aside-row">
            <div className="tab-content">
              <div className="tab-pane show active" id="photos-tab">
                <div className="tyn-media-list">
                  <div className="tyn-media-group tyn-media-box">
                    <div className="tyn-media">
                      <img src="/images/gallery/1.jpg" alt="Gallery" />
                    </div>
                  </div>
                  <div className="tyn-media-group tyn-media-box">
                    <div className="tyn-media">
                      <img src="/images/gallery/2.jpg" alt="Gallery" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="tab-pane" id="videos-tab">
                <p>No videos shared yet</p>
              </div>
              
              <div className="tab-pane" id="files-tab">
                <p>No files shared yet</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`tab-pane ${activeTab === 'options' ? 'show active' : ''}`} id="chat-options" tabIndex={0}>
          <div className="tyn-aside-row">
            <h6 className="tyn-aside-title">Chat Options</h6>
            <ul className="tyn-aside-list">
              <li className="tyn-aside-item">
                <button 
                  className="btn btn-danger w-100"
                  data-bs-toggle="modal" 
                  data-bs-target="#deleteChat"
                >
                  Delete Conversation
                </button>
              </li>
              <li className="tyn-aside-item">
                <button className="btn btn-outline-light w-100">
                  Block User
                </button>
              </li>
            </ul>
          </div>
          
          <div className="tyn-aside-row">
            <h6 className="tyn-aside-title">Shared Links</h6>
            <div className="tyn-links-list">
              <div className="tyn-links-item">
                <div className="tyn-links-media">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-link-45deg" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                  </svg>
                </div>
                <div className="tyn-links-content">
                  <h6 className="tyn-links-title">
                    <a href="#" target="_blank">Website Link Example</a>
                  </h6>
                  <span className="small">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatOptions;