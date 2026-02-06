// src/components/Sidebar.jsx - ALIGNED VERSION
import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine,
  RiFileTextLine,
  RiBarChartLine,
  RiHistoryLine,
  RiUserLine,
  RiCloseLine,
  RiArrowRightSLine,
  RiShieldUserLine,
} from 'react-icons/ri';
import { getAdminUser } from '../utils/tokenUtils';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: RiDashboardLine },
    { path: '/complaints', label: 'Complaints', icon: RiFileTextLine },
    { path: '/analytics', label: 'Analytics', icon: RiBarChartLine },
    { path: '/activity-logs', label: 'Activity Logs', icon: RiHistoryLine },
    { path: '/profile', label: 'Profile', icon: RiUserLine },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky lg:top-0 top-0 left-0 
          z-[70] lg:z-30
          w-[280px] sm:w-[300px] lg:w-72
          h-screen
          bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          shadow-2xl lg:shadow-none
        `}
      >
        {/* ========== HEADER (h-16 to match Navbar) ========== */}
        <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo Icon */}
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <RiShieldUserLine className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                CCMS Admin
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                University of Lucknow
              </p>
            </div>
          </div>
          {/* Close Button - Mobile Only */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors flex-shrink-0"
            aria-label="Close sidebar"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* ========== NAVIGATION (NO SCROLL) ========== */}
        <nav className="flex-1 px-3 py-4">
          <div className="mb-3 px-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Navigation
            </p>
          </div>
          
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-sm flex-1">{item.label}</span>
                      <RiArrowRightSLine className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ========== USER PROFILE CARD ========== */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200 group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {adminUser?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {adminUser?.role || "Administrator"}
              </p>
            </div>
            <RiArrowRightSLine className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
          </button>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="flex-shrink-0 px-3 py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                CCMS v1.0.0
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                © 2024 University of Lucknow
              </p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">UL</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;