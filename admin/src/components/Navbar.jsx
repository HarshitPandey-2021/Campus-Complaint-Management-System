// src/components/Navbar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiUserSettingsFill, RiMenuFoldLine, RiLogoutBoxRLine } from 'react-icons/ri';
import DarkModeToggle from './DarkModeToggle'; // ✅ ADD

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('ccms-admin-session');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-indigo-700 dark:bg-gray-900 text-white shadow-sm transition-colors">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Logo and Title */}
        <div className="flex items-center space-x-2">
          <RiUserSettingsFill className="h-6 w-6" />
          <span className="text-xl font-bold">CCMS Admin Panel</span>
        </div>

        {/* Center Section: Spacer */}
        <div className="flex-grow"></div>

        {/* Right Section: Actions */}
        
        {/* Mobile Icons (Visible < md) */}
        <div className="flex items-center space-x-2 md:hidden">
          {/* Dark Mode Toggle */}
          <DarkModeToggle />
          
          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-white hover:bg-indigo-600 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150 ease-in-out"
            aria-label="Logout"
          >
            <RiLogoutBoxRLine className="h-6 w-6" />
          </button>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-white hover:bg-indigo-600 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150 ease-in-out"
            aria-label="Toggle sidebar menu"
          >
            <RiMenuFoldLine className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Info and Actions (Visible >= md) */}
        <div className="hidden items-center space-x-4 md:flex">
          {/* Dark Mode Toggle */}
          <DarkModeToggle />
          
          {/* Admin Name/Email */}
          <div className="text-right">
            <p className="text-sm font-medium">Jane Doe</p>
            <p className="text-xs text-indigo-200 dark:text-gray-400">admin@college.edu</p>
          </div>
          
          {/* Full Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded-md bg-indigo-600 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-indigo-500 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <RiLogoutBoxRLine className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;