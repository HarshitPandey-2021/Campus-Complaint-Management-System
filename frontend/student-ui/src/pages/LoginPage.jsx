// src/pages/LoginPage.jsx (landing - 5174) - ✅ FIXED WITH ROLE PARAM
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../api";

const ADMIN_URL = import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5173";
const USER_URL = import.meta.env.VITE_USER_APP_URL || "http://localhost:3001";

console.log("🔧 Login URLs:", { ADMIN_URL, USER_URL });

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const resp = await login(form.email, form.password, form.role);
      console.log("📥 Login Response:", resp);

      if (resp.token && resp.user) {
        // ✅ CRITICAL FIX: Role param add kiya URL me
        const authData = encodeURIComponent(
          JSON.stringify({
            token: resp.token,
            user: resp.user,
            role: form.role, // ✅ REQUESTED ROLE send kar rahe hain
          })
        );

        console.log("👤 Role (requested):", form.role);
        console.log("👤 Role (actual):", resp.user.role);
        console.log("🔗 Redirecting with role:", form.role);

        if (resp.user.role === "admin") {
          console.log("🔗 Redirecting admin to:", `${ADMIN_URL}/?auth=${authData}`);
          window.location.href = `${ADMIN_URL}/?auth=${authData}`;
        } else if (resp.user.role === "student") {
          console.log("🔗 Redirecting student to:", `${USER_URL}/user/dashboard?auth=${authData}`);
          window.location.href = `${USER_URL}/user/dashboard?auth=${authData}`;
        } else {
          setError("Unknown user role: " + resp.user.role);
        }
      } else {
        setError(resp.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      
      // ✅ Backend se proper error message show karo
      if (err.message.includes("Access denied") || err.message.includes("registered as")) {
        setError(err.message);
      } else {
        setError("Login failed. Try again.");
      }
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(192,38,211,0.15), rgba(14,165,233,0.12), rgba(0,128,128,0.12))",
      }}
    >
      <div
        className="p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75))",
        }}
      >
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{
            background: "linear-gradient(90deg, #c026d3, #0ea5e9, #008080)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Login
        </h2>

        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-4 text-gray-800" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3] outline-none"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] outline-none"
              required
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {/* ✅ Role selector with clear visual feedback */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Login As
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-lg"
            >
              <option value="student">👨‍🎓 Student Portal</option>
              <option value="admin">🛡️ Admin Panel</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-[1.02] text-lg"
            style={{
              background:
                "linear-gradient(90deg, #c026d3, #0ea5e9, #008080)",
            }}
          >
            {loading ? "🔄 Logging in..." : `🚀 Login as ${form.role === 'admin' ? 'Admin' : 'Student'}`}
          </button>

          <p className="text-center text-gray-700 mt-4 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#c026d3] hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
