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
   const isActive = pathname === href;

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