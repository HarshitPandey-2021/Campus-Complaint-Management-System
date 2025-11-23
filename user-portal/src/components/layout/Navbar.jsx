// src/components/layout/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DarkModeToggle from '../common/DarkModeToggle';
import RoleBadge from '../common/RoleBadge';
import { RiMenuLine, RiLogoutBoxLine, RiUserLine, RiHome5Line } from 'react-icons/ri';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Menu Button + Title (Clickable) */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <RiMenuLine className="h-6 w-6" />
            </button>
            
            {/* Title + Role Badge - CLICKABLE */}
            <button
              onClick={() => navigate('/user/dashboard')}
              className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 group"
            >
              <RiHome5Line className="hidden sm:block h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <h1 className="text-sm sm:text-base lg:text-xl font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Campus Complaint Portal
              </h1>
              <div className="hidden sm:block flex-shrink-0">
                <RoleBadge role={user?.role} />
              </div>
            </button>
          </div>

          {/* RIGHT: Dark Mode + User Profile + Logout */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* User Profile - CLICKABLE (Desktop) */}
            <button
              onClick={() => navigate('/user/profile')}
              className="hidden md:flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px] lg:max-w-[200px] text-left">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate text-left">
                  {user?.role === 'student' ? user?.rollNo : user?.employeeId}
                </p>
              </div>
            </button>

            {/* User Avatar Only (Mobile) - CLICKABLE */}
            <button
              onClick={() => navigate('/user/profile')}
              className="md:hidden w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 hover:scale-110 transition-transform"
              aria-label="Go to profile"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
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