import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "../api.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    roll: "",
    email: "",
    password: "",
    confirmPassword: "",
    // ✅ REMOVED: role field - users can only sign up as students
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function isStrongPassword(pwd) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isStrongPassword(form.password)) {
      setError(
        "Password must be at least 8 characters and include a number and an uppercase letter."
      );
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED: Always register as "student" - no choice given
      await signupApi(
        form.name.trim(),
        form.roll.trim(),
        form.email.trim(),
        form.password,
        "student" // ✅ Hardcoded - users can ONLY sign up as students
      );
      alert("Signup successful! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed. Try again.");
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
            background:
              "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Student Sign Up
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              placeholder="Enter your full name"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#c026d3] focus:border-transparent outline-none transition-all"
              onChange={handleChange}
              value={form.name}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number <span className="text-red-500">*</span>
            </label>
            <input
              name="roll"
              placeholder="Enter your roll number"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent outline-none transition-all"
              onChange={handleChange}
              value={form.roll}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email address"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all"
              onChange={handleChange}
              value={form.email}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#c026d3] focus:border-transparent outline-none transition-all"
              onChange={handleChange}
              value={form.password}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be 8+ characters with uppercase & number
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent outline-none transition-all"
              onChange={handleChange}
              value={form.confirmPassword}
              required
            />
          </div>

          {/* ✅ REMOVED: Role selection radio buttons
              Admin accounts should be created by:
              1. Direct database insertion
              2. Super-admin panel
              3. Seeding during initial setup
          */}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-6"
            style={{
              background:
                "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Student Account"
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold hover:underline"
            style={{ color: "#c026d3" }}
          >
            Login here
          </Link>
        </p>

        {/* ✅ Optional: Info for admins */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Admin accounts are managed by system administrators
        </p>
      </div>
    </div>
  );
}