import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-teal-600 via-blue-700 to-blue-900 text-white shadow-lg">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <img
            src="/images/logo.png"
            alt="University Logo"
            className="h-10 w-10 rounded-full"
          />
          <span className="text-xl font-semibold tracking-wide">
            UNIVERSITY OF LUCKNOW
          </span>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          {/* LOGIN BUTTON */}
          <Link to="/login">
            <button className="bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Login
            </button>
          </Link>

          {/* SIGNUP BUTTON */}
          <Link to="/signup">
            <button className="bg-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-500 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
