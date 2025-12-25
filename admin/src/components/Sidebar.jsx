// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  RiDashboardFill,
  RiFileTextFill,
  RiBarChartFill,
  RiHistoryLine,
  RiUserFill,
  RiCloseLine,
} from 'react-icons/ri';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: RiDashboardFill },
    { path: '/complaints', label: 'Complaints', icon: RiFileTextFill },
    { path: '/analytics', label: 'Analytics', icon: RiBarChartFill },
    { path: '/activity-logs', label: 'Activity Logs', icon: RiHistoryLine },
    { path: '/profile', label: 'Profile', icon: RiUserFill },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-40 
          w-64 h-screen md:h-auto
          bg-white dark:bg-gray-800 shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Sidebar Header - Mobile Only */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Menu
          </h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <RiCloseLine className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-semibold shadow-md scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-102'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
              CCMS v1.0.0
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
              Admin Portal
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
