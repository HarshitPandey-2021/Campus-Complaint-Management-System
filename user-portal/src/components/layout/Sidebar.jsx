// src/components/layout/Sidebar.jsx - FINAL VERSION, NO SCROLLING
import React, { useEffect } from "react";
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
    { path: "/user/dashboard", icon: RiDashboardLine, label: "Dashboard" },
    { path: "/user/submit", icon: RiAddCircleLine, label: "Submit Complaint" },
    { path: "/user/my-complaints", icon: RiFileListLine, label: "My Complaints" },
    { path: "/user/profile", icon: RiUserLine, label: "Profile" },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col z-30">
        
        {/* Navigation - Simple, No Scroll */}
        <nav className="flex-1 p-3">
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
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      } transition-colors`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <RiArrowRightSLine className={`h-5 w-5 ml-auto transition-all ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Card - Bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => navigate('/user/profile')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
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

      {/* ========== MOBILE SIDEBAR ========== */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 z-50 lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <RiHome5Line className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Campus Portal
              </h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                User Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors flex-shrink-0"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
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
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <RiArrowRightSLine className={`h-5 w-5 ml-auto ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              navigate('/user/profile');
              handleNavClick();
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
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