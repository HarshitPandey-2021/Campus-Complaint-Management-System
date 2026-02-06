// src/components/layout/Navbar.jsx - FINAL POLISHED VERSION
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DarkModeToggle from '../common/DarkModeToggle';
import RoleBadge from '../common/RoleBadge';
import { RiMenuLine, RiLogoutBoxLine, RiHome5Line } from 'react-icons/ri';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Menu + Branding */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <RiMenuLine className="h-5 w-5" />
            </button>
            
            {/* Logo & Title */}
            <button
              onClick={() => navigate('/user/dashboard')}
              className="flex items-center gap-2.5 min-w-0 group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <RiHome5Line className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Campus Complaint Portal
                </h1>
                <div className="hidden md:block">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
            </button>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Divider - Desktop Only */}
            <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* User Profile - Desktop */}
            <button
              onClick={() => navigate('/user/profile')}
              className="hidden md:flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role === 'student' ? user?.rollNo : user?.employeeId}
                </p>
              </div>
            </button>

            {/* User Avatar - Mobile */}
            <button
              onClick={() => navigate('/user/profile')}
              className="md:hidden h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md active:scale-95 transition-transform"
              aria-label="Go to profile"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <RiLogoutBoxLine className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;