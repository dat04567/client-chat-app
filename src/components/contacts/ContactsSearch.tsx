'use client';

import React from 'react';

interface ContactsSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ContactsSearch: React.FC<ContactsSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
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
  );
};

export default ContactsSearch;
