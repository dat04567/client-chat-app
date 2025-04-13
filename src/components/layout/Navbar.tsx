'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NavItem from './NavItem';
import {
   ChatIcon,
   ContactsIcon,
   ChatbotIcon,
   StoriesIcon,
   MenuIcon,
   NotificationsIcon,
} from '../icons';

const Navbar = () => {
   return (
      <nav className="tyn-appbar">
         <div className="tyn-appbar-wrap">
            <div className="tyn-appbar-logo">
               <Link className="tyn-logo" href="/">
                  <Image
                     src="/miumiu2.png"
                     className="!h-[50px]"
                     width={50}
                     height={50}
                     alt="icon"
                  />
               </Link>
            </div>
            <div className="tyn-appbar-content">
               <ul className="tyn-appbar-nav tyn-appbar-nav-start">
                  <NavItem href="/messages" icon={<ChatIcon />} label="Chats" />
                  <NavItem href="/contacts" icon={<ContactsIcon />} label="Contacts" />
                  <NavItem
                     href="/chatbot"
                     icon={<ChatbotIcon />}
                     label="ChatBot"
                     className="d-none d-sm-inline-flex"
                  />
                  <NavItem
                     href="/stories"
                     icon={<StoriesIcon />}
                     label="Stories"
                     className="d-none d-sm-inline-flex"
                  />
               </ul>

               <ul className="tyn-appbar-nav tyn-appbar-nav-end">
                  <li className="tyn-appbar-item dropdown">
                     <button
                        className="tyn-appbar-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <MenuIcon />
                        <span className="d-none">Menu</span>
                     </button>
                     <div className="dropdown-menu dropdown-menu-auto dropdown-menu-end">
                        <ul className="tyn-list-links">{/* Menu items can be added here */}</ul>
                     </div>
                  </li>

                  <li className="tyn-appbar-item">
                     <button
                        className="tyn-appbar-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <NotificationsIcon />
                        <span className="d-none">Notifications</span>
                     </button>
                     <div className="dropdown-menu dropdown-menu-rg dropdown-menu-end">
                        <div className="dropdown-head">
                           <div className="title">Notifications</div>
                        </div>
                     </div>
                  </li>

                  <li className="tyn-appbar-item">
                     <button
                        className="d-inline-flex dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <div className="tyn-media tyn-size-lg tyn-circle">
                           <Image src="/images/avatar/3.jpg" alt="User" width={50} height={50} />
                        </div>
                     </button>
                     <div className="dropdown-menu dropdown-menu-end">
                        <div className="dropdown-gap">
                           <div className="tyn-media-group">
                              <div className="tyn-media tyn-size-lg">
                                 <Image
                                    src="/images/avatar/3.jpg"
                                    alt="User"
                                    width={50}
                                    height={50}
                                 />
                              </div>
                              <div className="tyn-media-col">
                                 <div className="tyn-media-row">
                                    <h6 className="name">User Name</h6>
                                    <div className="indicator varified">
                                       <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-check-circle-fill"
                                          viewBox="0 0 16 16">
                                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                       </svg>
                                    </div>
                                 </div>
                                 <div className="tyn-media-row">
                                    <p className="content">user@example.com</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <ul className="tyn-list-links">
                           <li>
                              <Link href="/profile">View Profile</Link>
                           </li>
                           <li>
                              <Link href="/account/settings">Account Settings</Link>
                           </li>
                           <li className="dropdown-divider"></li>
                           <li>
                              <Link href="/logout">Sign Out</Link>
                           </li>
                        </ul>
                     </div>
                  </li>
               </ul>
            </div>
         </div>
      </nav>
   );
};

export default Navbar;
