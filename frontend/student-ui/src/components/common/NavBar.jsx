import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-primary-700 text-white shadow-lg">
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
          <button className="bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Login
          </button>
          <button className="bg-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-500 transition">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
