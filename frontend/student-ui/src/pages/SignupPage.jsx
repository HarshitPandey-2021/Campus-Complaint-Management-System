import React, { useState } from "react";

export default function SignupModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    roll: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { alert("Passwords don't match"); return; }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      alert("Password must be 8+ chars, include number & uppercase");
      return;
    }
    alert("Signup submitted");
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-md"
        style={{ background:"linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.75))" }}>
        
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 via-blue-500 to-teal-600 bg-clip-text text-transparent">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
          <input name="name" placeholder="Full Name" onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" required />

          <input name="roll" placeholder="Roll Number" onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />

          <input name="email" type="email" placeholder="Email" onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />

          <input name="password" type="password" placeholder="Password" onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" required />

          <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition hover:scale-105"
            style={{ background:"linear-gradient(90deg,#c026d3,#0ea5e9,#008080)" }}
          >
            Sign Up
          </button>

          <button
            onClick={onClose}
            type="button"
            className="w-full mt-3 py-2 font-semibold text-gray-700 hover:opacity-70"
          >
            Close
          </button>
        </form>
      </div>
    </div>
  );
}
