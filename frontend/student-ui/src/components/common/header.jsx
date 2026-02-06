import React from "react";
import { Link } from "react-router-dom";
import logo from "/images/logo.png"; // Place your University logo in public/images/

const Header = () => {
  return (
    <header className="bg-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="University of Lucknow" className="w-10 h-10" />
          <h1 className="text-xl font-semibold tracking-wide">
            Campus Complaint Management System
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-x-6 text-sm font-medium hidden md:flex">
          <Link to="/" className="hover:text-teal-200">Home</Link>
          <Link to="/dashboard" className="hover:text-teal-200">Dashboard</Link>
          <Link to="/submit" className="hover:text-teal-200">Submit Complaint</Link>
          <Link to="/my-complaints" className="hover:text-teal-200">My Complaints</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="space-x-3">
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Login
          </Link>
          <Link to="/signup" className="bg-magenta-600 hover:bg-magenta-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
