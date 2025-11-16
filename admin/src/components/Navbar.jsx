import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiMenuFoldLine, RiLogoutBoxRLine } from 'react-icons/ri';
import DarkModeToggle from './DarkModeToggle';
import Tooltip from './Tooltip';
import NotificationPanel from './NotificationPanel';
import UniversityLogo from './UniversityLogo';

// Import logo
import universityLogo from '../assets/logo.png';

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('ccms-admin-session');
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-r from-indigo-700 to-indigo-800 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg transition-all duration-200">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* University Logo */}
        <UniversityLogo 
          imagePath={universityLogo}
          universityName="University of Lucknow"
        />

        {/* Center Section: Spacer */}
        <div className="flex-grow"></div>

        {/* Right Section: Actions */}
        
        {/* Mobile Icons (Visible < md) */}
        <div className="flex items-center space-x-2 md:hidden">
          {/* Notifications - Mobile - ❌ REMOVE <div> wrapper */}
          <Tooltip text="Notifications">
            <NotificationPanel />
          </Tooltip>

          {/* Dark Mode Toggle - Mobile */}
          <Tooltip text="Toggle theme">
            <div className="flex items-center">
              <DarkModeToggle />
            </div>
          </Tooltip>
          
          {/* Mobile Logout Button */}
          <Tooltip text="Logout">
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-150 btn-ripple"
              aria-label="Logout"
            >
              <RiLogoutBoxRLine className="h-6 w-6" />
            </button>
          </Tooltip>
          
          {/* Hamburger Menu Button */}
          <Tooltip text="Menu">
            <button
              onClick={onMenuToggle}
              className="rounded-lg p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-150 btn-ripple"
              aria-label="Toggle sidebar menu"
            >
              <RiMenuFoldLine className="h-6 w-6" />
            </button>
          </Tooltip>
        </div>

        {/* Desktop Info and Actions (Visible >= md) */}
        <div className="hidden items-center space-x-4 md:flex">
          {/* Notifications - Desktop - ❌ REMOVE <div> wrapper */}
          <Tooltip text="View notifications">
            <NotificationPanel />
          </Tooltip>

          {/* Dark Mode Toggle - Desktop */}
          <Tooltip text="Toggle dark mode">
            <div className="flex items-center">
              <DarkModeToggle />
            </div>
          </Tooltip>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20"></div>
          
          {/* Admin Profile Info - Personalized */}
          <Tooltip text="View your profile">
            <button
              onClick={() => navigate('/profile')}
              className="text-right hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-150 group"
            >
              <p className="text-sm font-semibold group-hover:text-indigo-200 transition-colors">
                Notwhite444
              </p>
              <p className="text-xs text-indigo-200 dark:text-gray-400">
                Admin • University of Lucknow
              </p>
            </button>
          </Tooltip>
          
          {/* Full Logout Button */}
          <Tooltip text="Sign out of your account">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/50 btn-ripple"
            >
              <RiLogoutBoxRLine className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </Tooltip>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;