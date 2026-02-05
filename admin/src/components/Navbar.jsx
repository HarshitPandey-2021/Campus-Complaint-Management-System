// src/components/Navbar.jsx (Admin - Updated notification icon)
import React from "react";
import { useNavigate } from "react-router-dom";
import { RiMenuLine, RiLogoutBoxRLine, RiShieldUserLine } from "react-icons/ri";
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
      window.location.href = "https://ccms-home.vercel.app/";
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <RiMenuLine className="h-5 w-5" />
          </button>

          {/* Logo & Brand - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <RiShieldUserLine className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                CCMS Admin
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                University of Lucknow
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification & Theme - FIXED: Better icon visibility */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Tooltip text="Notifications">
              <NotificationPanel />
            </Tooltip>

            <Tooltip text="Toggle theme">
              <DarkModeToggle />
            </Tooltip>
          </div>

          {/* Divider - Desktop Only */}
          <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Profile Section - Desktop Only */}
          <div className="hidden md:flex items-center gap-3">
            <Tooltip text="View profile">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[120px]">
                    {adminUser?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {adminUser?.role || "Administrator"}
                  </p>
                </div>
              </button>
            </Tooltip>

            <Tooltip text="Sign out">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <RiLogoutBoxRLine className="h-5 w-5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </Tooltip>
          </div>

          {/* Mobile Logout Button */}
          <Tooltip text="Logout">
            <button
              onClick={handleLogout}
              className="md:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              aria-label="Logout"
            >
              <RiLogoutBoxRLine className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;