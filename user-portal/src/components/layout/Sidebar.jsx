// src/components/layout/Sidebar.jsx
// Sidebar for user portal: dashboard, submit complaint, list, profile.
import React from "react";
import { NavLink } from "react-router-dom";
import {
  RiDashboardLine,
  RiFileListLine,
  RiAddCircleLine,
  RiUserLine,
  RiCloseLine,
} from "react-icons/ri";

const Sidebar = ({ isOpen, onClose }) => {
  // Navigation items for sidebar (desktop + mobile)
  const navItems = [
    { path: "/user/dashboard", icon: RiDashboardLine, label: "Dashboard" },

    // path matches App.jsx route -> '/user/submit'
    { path: "/user/submit", icon: RiAddCircleLine, label: "Submit Complaint" },

    // FIX: path must match App.jsx route -> '/user/my-complaints'
    { path: "/user/my-complaints", icon: RiFileListLine, label: "My Complaints" },

    { path: "/user/profile", icon: RiUserLine, label: "Profile" },
  ];

  // Helper to generate classes based on active route
  const linkClasses = (isActive) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-lg"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200 z-30">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => linkClasses(isActive)}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-50 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="mb-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RiCloseLine className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={onClose} // close drawer after navigation
                className={({ isActive }) => linkClasses(isActive)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
