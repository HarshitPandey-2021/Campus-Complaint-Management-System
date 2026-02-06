// src/components/Navbar.jsx - ALIGNED VERSION
import React from "react";
import { useNavigate } from "react-router-dom";
import { RiMenuLine, RiLogoutBoxRLine, RiShieldUserLine,RiLogoutBoxLine } from "react-icons/ri";
import DarkModeToggle from "./DarkModeToggle";
import Tooltip from "./Tooltip";
import NotificationPanel from "./NotificationPanel";
import { getAdminUser, logoutAdmin } from "../utils/tokenUtils";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logoutAdmin();
      localStorage.removeItem("dashboard-welcome-seen");
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
      {/* ✅ Changed: h-16 on all screens to match sidebar header */}
      <div className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <RiMenuLine className="h-5 w-5" />
          </button>

          {/* ✅ MOBILE ONLY: Show branding with small icon */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
              <RiShieldUserLine className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                CCMS Admin
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
                University of Lucknow
              </p>
            </div>
          </div>

          {/* ✅ DESKTOP: Simple page indicator (Sidebar has full branding) */}
          <div className="hidden lg:block">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Welcome to Admin Dashboard
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notification */}
          <Tooltip text="Notifications">
            <NotificationPanel />
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip text="Toggle theme">
            <DarkModeToggle />
          </Tooltip>

          {/* Divider - Desktop Only */}
          <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 lg:mx-2" />

          {/* Profile Section - Desktop Only */}
          <div className="hidden md:flex items-center gap-2">
            <Tooltip text="View profile">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                  {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="text-left hidden lg:block max-w-[140px]">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {adminUser?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {adminUser?.role || "Administrator"}
                  </p>
                </div>
              </button>
            </Tooltip>

            <Tooltip text="Sign out">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium text-sm transition-all duration-200"
              >
                <RiLogoutBoxRLine className="h-4 w-4" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </Tooltip>
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex-shrink-0"
            aria-label="Logout"
          >
            <RiLogoutBoxLine className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;