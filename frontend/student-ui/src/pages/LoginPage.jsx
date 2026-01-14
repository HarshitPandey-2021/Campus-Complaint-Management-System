import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginApi } from "../api.js";

const ADMIN_APP_URL =
  import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5173";
const USER_APP_URL =
  import.meta.env.VITE_USER_APP_URL || "http://localhost:3001";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function buildUserAuthUrl(token, refreshToken, user) {
    const payload = {
      token,
      refreshToken: refreshToken || null,
      user,
      timestamp: Date.now(),
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    const base = USER_APP_URL.replace(/\/+$/, "");
    return `${base}/?auth=${encoded}`;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const resp = await loginApi(form.email.trim(), form.password, form.role);

      if (!resp || !resp.user || !resp.token) {
        setError("Invalid response from server.");
        return;
      }

      const { user, token, refreshToken } = resp;

      if (user.role === "admin") {
        const adminUser = {
          id: user.id || user._id?.toString() || user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        const codeResp = await fetch(`${API_BASE}/auth/admin-session-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            refreshToken: refreshToken || null,
            user: adminUser,
          }),
        });

        if (!codeResp.ok) {
          setError("Failed to create admin session. Please try again.");
          return;
        }

        const { code } = await codeResp.json();

        const adminUrl = `${ADMIN_APP_URL}?code=${code}`;
        window.location.href = adminUrl;
        return;
      }

      if (user.role === "student") {
        const studentUser = {
          id: user.id || user._id?.toString() || user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          roll: user.roll || null,
        };
        const url = buildUserAuthUrl(token, refreshToken || null, studentUser);
        window.location.href = url;
        return;
      }

      setError(`Unsupported role: ${user.role}`);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
            background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
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
        </form>

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
      </div>
    </div>
  );
}
