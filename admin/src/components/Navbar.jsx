// src/components/Navbar.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { RiMenuFoldLine, RiLogoutBoxRLine } from "react-icons/ri";
import DarkModeToggle from "./DarkModeToggle";
import Tooltip from "./Tooltip";
import NotificationPanel from "./NotificationPanel";
import UniversityLogo from "./UniversityLogo";
import { getAdminUser, logoutAdmin } from "../utils/tokenUtils";
import universityLogo from "../assets/logo.png";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logoutAdmin();
      localStorage.removeItem("dashboard-welcome-seen"); // UI flag only
      window.location.href = "https://ccms-home.vercel.app/";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-indigo-700 to-indigo-800 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={toggleSidebar}
            className="md:hidden flex-shrink-0 rounded-lg p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            aria-label="Toggle sidebar"
          >
            <RiMenuFoldLine className="h-6 w-6" />
          </button>

          <div className="min-w-0">
            <UniversityLogo
              imagePath={universityLogo}
              universityName="University of Lucknow"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 md:hidden">
            <Tooltip text="Notifications">
              <NotificationPanel />
            </Tooltip>
            <Tooltip text="Toggle theme">
              <DarkModeToggle />
            </Tooltip>
            <Tooltip text="Logout">
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                aria-label="Logout"
              >
                <RiLogoutBoxRLine className="h-6 w-6" />
              </button>
            </Tooltip>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Tooltip text="Notifications">
              <NotificationPanel />
            </Tooltip>

            <Tooltip text="Toggle dark mode">
              <DarkModeToggle />
            </Tooltip>

            <div className="h-8 w-px bg-white/20" />

            <Tooltip text="View profile">
              <button
                onClick={() => navigate("/profile")}
                className="text-right hover:bg-white/10 px-3 py-2 rounded-lg transition-all group"
              >
                <p className="text-sm font-semibold group-hover:text-indigo-200 transition-colors truncate max-w-[150px]">
                  {adminUser?.name || "Admin"}
                </p>
                <p className="text-xs text-indigo-200 dark:text-gray-400 truncate max-w-[150px]">
                  {(adminUser?.role || "Admin") + " • UoL"}
                </p>
              </button>
            </Tooltip>

            <Tooltip text="Sign out">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <RiLogoutBoxRLine className="h-5 w-5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
