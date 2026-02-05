// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  RiDashboardLine,
  RiFileListLine,
  RiAddCircleLine,
  RiUserLine,
  RiCloseLine,
  RiArrowRightSLine,
  RiHome5Line,
} from "react-icons/ri";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { path: "/user/dashboard", icon: RiDashboardLine, label: "Dashboard" },
    { path: "/user/submit", icon: RiAddCircleLine, label: "Submit Complaint" },
    { path: "/user/my-complaints", icon: RiFileListLine, label: "My Complaints" },
    { path: "/user/profile", icon: RiUserLine, label: "Profile" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col z-30">
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Menu
            </p>
          </div>
          
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
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

        {/* User Card */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => navigate('/user/profile')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 border border-gray-200 dark:border-gray-700 transition-all duration-200 group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || "user@campus.edu"}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-out z-50 lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <RiHome5Line className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Campus Portal
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                User Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Menu
            </p>
          </div>
          
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <RiArrowRightSLine className={`h-5 w-5 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Card */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              navigate('/user/profile');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;