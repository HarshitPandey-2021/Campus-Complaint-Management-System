// src/components/Sidebar.jsx
import React from 'react';
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

  const navItems = [
    { path: '/', label: 'Dashboard', icon: RiDashboardLine },
    { path: '/complaints', label: 'Complaints', icon: RiFileTextLine },
    { path: '/analytics', label: 'Analytics', icon: RiBarChartLine },
    { path: '/activity-logs', label: 'Activity Logs', icon: RiHistoryLine },
    { path: '/profile', label: 'Profile', icon: RiUserLine },
  ];

  return (
    <>
      {/* Mobile Overlay - z-50 to be above navbar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - z-50 to be above navbar on mobile */}
      <aside
        className={`
          fixed lg:sticky lg:top-0 top-0 left-0 
          z-50 lg:z-30
          w-72 lg:w-64 h-screen
          bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <RiShieldUserLine className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                CCMS Admin
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Control Panel
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close sidebar"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Main Menu
            </p>
          </div>
          
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isActive 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                        } transition-colors`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <RiArrowRightSLine className={`h-5 w-5 transition-all duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } ${isActive ? 'translate-x-0' : '-translate-x-2 group-hover:translate-x-0'}`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile Card */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              navigate('/profile');
              window.innerWidth < 1024 && toggleSidebar();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 border border-gray-200 dark:border-gray-700 transition-all duration-200 group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
              {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {adminUser?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {adminUser?.email || "admin@university.edu"}
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-3 pb-4">
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  CCMS v1.0.0
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Portal
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">UL</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;