import React from "react";

export default function Navbar({ onLoginOpen, onSignupOpen }) {
  return (
    <nav className="bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO + UNIVERSITY NAME */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => (window.location.href = "/")}
        >
          <img
            src="/images/logo.png"
            alt="University Logo"
            className="h-10 w-10 rounded-full shadow-md group-hover:scale-105 transition"
          />
          <span className="text-xl font-bold tracking-wide group-hover:opacity-90 transition">
            UNIVERSITY OF LUCKNOW
          </span>
        </div>

        {/* BUTTONS */}
        <div className="flex space-x-4">

          {/* LOGIN BUTTON */}
          <button
            onClick={onLoginOpen}
            className="px-5 py-2 rounded-lg bg-white text-gray-900 font-semibold
                      shadow hover:bg-gray-100 hover:shadow-lg transition-all duration-200"
          >
            Login
          </button>

          {/* SIGNUP BUTTON */}
          <button
            onClick={onSignupOpen}
            className="px-5 py-2 rounded-lg font-semibold
                      bg-gradient-to-r from-teal-400 to-blue-500 text-white
                      shadow hover:shadow-lg hover:scale-[1.03] transition-all duration-200"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
