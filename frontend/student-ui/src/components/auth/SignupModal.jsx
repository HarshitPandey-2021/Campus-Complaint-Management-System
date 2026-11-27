import React, { useState } from "react";

export default function SignupModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    roll: "",
    email: "",
    password: "",
    confirm: "",
  });

  const validatePassword = (pwd) =>
    pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);

  const passwordValid = validatePassword(form.password);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[999] animate-fadeIn">

      <div
        className="w-full max-w-md rounded-3xl shadow-xl p-8 bg-white 
        border border-gray-200 animate-slideUp"
      >
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 w-full h-2 rounded-t-3xl
          bg-gradient-to-r from-teal-400 via-fuchsia-500 to-blue-600"></div>

        <h2
          className="text-3xl font-extrabold text-center mb-8 
          bg-gradient-to-r from-teal-500 via-fuchsia-600 to-blue-700 
          bg-clip-text text-transparent"
        >
          Create Account
        </h2>

        <form className="space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
              bg-white focus:ring-2 focus:ring-teal-400 outline-none"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* ROLL */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Roll Number</label>
            <input
              type="text"
              value={form.roll}
              onChange={(e) => setForm({ ...form, roll: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
              bg-white focus:ring-2 focus:ring-fuchsia-400 outline-none"
              placeholder="Enter roll number"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
              bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg bg-white outline-none
              border ${passwordValid ? "border-green-400" : "border-red-400"}
              focus:ring-2 focus:ring-fuchsia-400`}
              placeholder="Password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be 8+ chars with 1 uppercase & 1 number.
            </p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
              bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Confirm password"
              required
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={!passwordValid || form.password !== form.confirm}
            className="w-full py-2 text-lg font-semibold text-white rounded-lg
              bg-gradient-to-r from-teal-400 via-fuchsia-500 to-blue-600
              shadow-md hover:shadow-lg hover:scale-[1.02]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300"
          >
            Sign Up
          </button>
        </form>

        {/* CLOSE */}
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
