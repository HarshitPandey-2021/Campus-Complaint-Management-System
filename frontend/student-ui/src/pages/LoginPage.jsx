import React from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
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

        <form className="space-y-4 text-gray-800">
          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3] outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] outline-none"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(90deg, #c026d3, #0ea5e9, #008080)",
            }}
          >
            Login
          </button>

          {/* Signup Redirect */}
          <p className="text-center text-gray-700 mt-4">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold"
              style={{ color: "#c026d3" }}
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
