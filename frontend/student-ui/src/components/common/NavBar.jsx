import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-teal-600 via-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
        
        {/* Logo and Brand - BIGGER & BETTER */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <img
            src="/images/logo.png"
            alt="University Logo"
            className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full shadow-md"
          />
          {/* Full name always, just size changes */}
          <div className="flex flex-col">
            <span className="text-base md:text-xl lg:text-2xl font-bold tracking-wide">
              UNIVERSITY OF LUCKNOW
            </span>
            <span className="text-xs md:text-sm text-gray-200 font-light">
              Campus Complaint Management
            </span>
          </div>
        </div>

        {/* Buttons - SAME (WORKING WELL) */}
        <div className="flex space-x-2 md:space-x-3">
          {/* LOGIN BUTTON */}
          <Link to="/login">
            <button className="bg-white text-teal-700 px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap text-sm md:text-base shadow-md">
              Login
            </button>
          </Link>

          {/* SIGNUP BUTTON */}
          <Link to="/signup">
            <button className="bg-yellow-400 text-gray-900 px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-semibold hover:bg-yellow-300 transition whitespace-nowrap text-sm md:text-base shadow-md">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;