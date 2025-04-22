'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItemProps = {
   href: string;
   icon: React.ReactNode;
   label: string;
   className?: string;
};

const NavItem = ({ href, icon, label, className = '' }: NavItemProps) => {
   const pathname = usePathname();
   // Check if the current path starts with the href (to handle nested routes)
   // This will handle cases like /messages/15d092d5-523b-4beb-a73f-2dc051b698ee
   const isActive = href === '/' 
     ? pathname === '/' 
     : pathname === href || pathname.startsWith(`${href}/`);

   return (
      <li className={`tyn-appbar-item ${className} ${isActive ? 'active current-page' : ''}`}>
         <Link className="tyn-appbar-link" href={href}>
            {icon}
            <span className="d-none">{label}</span>
         </Link>
      </li>
   );
};

export default NavItem;