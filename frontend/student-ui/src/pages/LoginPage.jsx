// src/pages/LoginPage.jsx - COMPLETE FIXED VERSION

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";

const ADMIN_URL = import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5173";
const USER_URL = import.meta.env.VITE_USER_APP_URL || "http://localhost:3001";

console.log("🔧 Login URLs:", { ADMIN_URL, USER_URL });

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    console.log("🔐 Login attempt:", { email: form.email, role: form.role });
    setLoading(true);

    try {
      const resp = await login(form.email, form.password, form.role);
      console.log("📥 Login Response:", resp);

      if (resp.token && resp.user) {
        console.log("👤 Requested role:", form.role);
        console.log("👤 Actual role:", resp.user.role);
        console.log("👤 User data:", resp.user);

        // Save session using AuthContext
        authLogin(resp);

        if (resp.user.role === "admin") {
          console.log("🔑 Admin role detected");

          // ✅ FIXED: Pass data to admin portal via URL (cross-origin solution)
          const adminData = {
            token: resp.token,
            user: {
              name: resp.user.name,
              email: resp.user.email,
              role: resp.user.role,
              userId: resp.user._id || resp.user.id,
            },
          };

          // Add refresh token if available
          if (resp.refreshToken) {
            adminData.refreshToken = resp.refreshToken;
          }

          const authData = encodeURIComponent(JSON.stringify(adminData));
          const target = `${ADMIN_URL}/?auth=${authData}`;

          console.log("🔗 Redirecting to admin portal with auth data");

          await new Promise((resolve) => setTimeout(resolve, 100));
          window.location.href = target;

        } else if (resp.user.role === "student") {
          console.log("👨‍🎓 Student role detected");

          const authPayload = {
            token: resp.token,
            user: {
              _id: resp.user._id || resp.user.id,
              name: resp.user.name,
              email: resp.user.email,
              role: resp.user.role,
              ...(resp.user.roll && { roll: resp.user.roll }),
            },
          };

          const authData = encodeURIComponent(JSON.stringify(authPayload));
          const target = `${USER_URL}/user/dashboard?auth=${authData}`;
          console.log("🔗 Redirecting student to:", target);
          window.location.href = target;

        } else {
          console.error("❌ Unknown role:", resp.user.role);
          setError("Unknown user role: " + resp.user.role);
        }
      } else {
        console.error("❌ Missing token or user");
        setError(resp.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      if (
        err.message?.includes("Access denied") ||
        err.message?.includes("registered as")
      ) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(192,38,211,0.15), rgba(14,165,233,0.12), rgba(0,128,128,0.10))",
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
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-gray-800">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3] outline-none"
            onChange={handleChange}
            value={form.email}
            required
            disabled={loading}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] outline-none"
            onChange={handleChange}
            value={form.password}
            required
            disabled={loading}
          />

          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="student"
                checked={form.role === "student"}
                onChange={handleChange}
                disabled={loading}
                className="cursor-pointer"
              />
              <span>Student</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={form.role === "admin"}
                onChange={handleChange}
                disabled={loading}
                className="cursor-pointer"
              />
              <span>Admin</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-700 mt-4">
            New user?{" "}
            <Link
              to="/signup"
              className="font-semibold hover:underline"
              style={{ color: "#c026d3" }}
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
