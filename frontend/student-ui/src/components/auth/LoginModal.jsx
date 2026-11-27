import React, { useState } from "react";

export default function LoginModal({ isOpen, onClose, onSignupOpen }) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center 
        bg-black/30 backdrop-blur-sm z-[999] animate-fadeIn">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 
          animate-slideUp border border-gray-200 relative">

        {/* header highlight */}
        <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl
            bg-gradient-to-r from-teal-400 to-blue-600"></div>

        <h2 className="text-3xl font-extrabold text-center mb-6 text-teal-600">
          Welcome Back
        </h2>

        {/* FORM */}
        <form className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-100
                border border-gray-300
                focus:ring-2 focus:ring-teal-400 outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-100
                border border-gray-300
                focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-lg font-semibold text-white rounded-lg
              bg-teal-600 hover:bg-teal-500
              shadow-md hover:shadow-lg
              transition-all duration-300"
          >
            Login
          </button>
        </form>

        {/* SIGNUP REDIRECT */}
        <p className="text-center text-gray-700 mt-4">
          Don’t have an account?{" "}
          <button
            onClick={() => {
              onClose();       // close login modal
              onSignupOpen();  // open signup modal
            }}
            className="text-blue-600 font-semibold hover:text-blue-800 transition"
          >
            Sign Up
          </button>
        </p>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="mt-6 w-full text-gray-600 hover:text-gray-800 transition"
        >
          Close
        </button>

      </div>
    </div>
  );
}
