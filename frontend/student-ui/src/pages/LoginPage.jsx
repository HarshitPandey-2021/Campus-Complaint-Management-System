import React, { useState } from "react";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-md"
        style={{ background:"linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.75))" }}>
        
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 via-blue-500 to-teal-600 bg-clip-text text-transparent">
          Login
        </h2>

        <form className="space-y-4 text-gray-800">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition hover:scale-105"
            style={{ background:"linear-gradient(90deg,#c026d3,#0ea5e9,#008080)" }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 py-2 font-semibold text-gray-700 hover:opacity-70"
          >
            Close
          </button>
        </form>
      </div>
    </div>
  );
}
