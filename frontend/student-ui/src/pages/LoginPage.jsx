import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../api";

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
      console.log('📥 Login Response:', resp);
      
      if (resp.token && resp.user) {
        // Encode data for URL
        const authData = encodeURIComponent(JSON.stringify({
          token: resp.token,
          user: resp.user
        }));
        
        // Role-based redirection WITH auth data in URL
        if (resp.user.role === "admin") {
          window.location.href = `http://localhost:3002/?auth=${authData}`;
        } else if (resp.user.role === "student") {
          window.location.href = `http://localhost:3001/user/dashboard?auth=${authData}`;
        } else {
          setError("Unknown user role.");
        }
      } else {
        setError(resp.message || "Login failed");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || "Login failed. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, rgba(192,38,211,0.15), rgba(14,165,233,0.12), rgba(0,128,128,0.12))"
      }}>
      <div className="p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-md"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75))"
        }}>
        <h2 className="text-3xl font-bold text-center mb-6"
          style={{
            background: "linear-gradient(90deg, #c026d3, #0ea5e9, #008080)",
            WebkitBackgroundClip: "text",
            color: "transparent"
          }}>
          Login
        </h2>
        {error && <div className="text-red-500 mb-2 text-center font-semibold">{error}</div>}
        <form className="space-y-4 text-gray-800" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
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
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] outline-none"
              required
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(90deg, #c026d3, #0ea5e9, #008080)" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-center text-gray-700 mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold" style={{ color: "#c026d3" }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
