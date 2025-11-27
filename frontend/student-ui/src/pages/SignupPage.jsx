import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", roll: "", email: "", password: "", confirmPassword: "", role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      setError("Password must be 8+ chars, include number & uppercase");
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.roll, form.email, form.password, form.role);
      alert("Signup successful! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: "linear-gradient(135deg, rgba(192,38,211,0.15), rgba(14,165,233,0.12), rgba(0,128,128,0.10))"}}>
      <div className="p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-md"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75))" }}>
        <h2 className="text-3xl font-bold text-center mb-6"
          style={{ background: "linear-gradient(90deg, #c026d3, #0ea5e9, #008080)", WebkitBackgroundClip: "text", color: "transparent" }}>
          Sign Up
        </h2>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
          <input name="name" placeholder="Full Name" className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3] outline-none" onChange={handleChange} value={form.name} required />
          <input name="roll" placeholder="Roll Number" className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] outline-none" onChange={handleChange} value={form.roll} required={form.role === "student"} disabled={form.role === "admin"} />
          <input name="email" type="email" placeholder="Email" className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none" onChange={handleChange} value={form.email} required />
          <input name="password" type="password" placeholder="Password" className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3] outline-none" onChange={handleChange} value={form.password} required />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] outline-none" onChange={handleChange} value={form.confirmPassword} required />
          {/* 🚩 Role Switcher */}
          <select name="role" value={form.role} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={loading} className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)" }}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
          <p className="text-center text-gray-700 mt-4">
            Already registered?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "#c026d3" }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
