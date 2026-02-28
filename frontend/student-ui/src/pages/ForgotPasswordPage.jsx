import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  requestPasswordResetApi,
  verifyPasswordResetOtpApi,
  resetPasswordApi,
} from "../api.js";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function sendOtp(isResend = false) {
    setError("");
    setMessage("");
    if (!identifier) {
      setError("Please enter your roll number or email.");
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordResetApi(identifier.trim());
      setMessage(
        res.message || "If an account exists, an OTP has been sent."
      );

      // Only in development: show OTP in console for testing (never in production build)
      if (import.meta.env.DEV && res.devOtp) {
        console.log("DEV ONLY - OTP:", res.devOtp);
      }

      if (!isResend) {
        setStep("otp");
      }
      setCooldown(60);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleIdentifierSubmit(e) {
    e.preventDefault();
    await sendOtp(false);
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyPasswordResetOtpApi(
        identifier.trim(),
        otp.trim()
      );
      setResetToken(res.resetToken);
      setMessage("OTP verified. Please set a new password.");
      setStep("reset");
    } catch (err) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordApi(resetToken, newPassword);
      setMessage(
        res.message || "Password reset successfully. You can login now."
      );
    } catch (err) {
      setError(err.message || "Failed to reset password.");
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
          Forgot Password
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
            {message}
          </div>
        )}

        {step === "identifier" && (
          <form
            onSubmit={handleIdentifierSubmit}
            className="space-y-4 text-gray-800"
          >
            <input
              type="text"
              placeholder="Roll number or email"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3] outline-none"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] disabled:opacity-60"
              style={{
                background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
              }}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-gray-800">
            <input
              type="text"
              placeholder="Enter OTP sent to your email"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] disabled:opacity-60"
              style={{
                background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
              }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => sendOtp(true)}
              disabled={loading || cooldown > 0}
              className="w-full mt-2 border px-3 py-2 rounded-lg font-semibold transition disabled:opacity-60"
              style={{
                borderColor: "#0ea5e9",
                color: "#0ea5e9",
              }}
            >
              {cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : "Resend OTP"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <>
            <form
              onSubmit={handleResetSubmit}
              className="space-y-4 text-gray-800"
            >
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3] outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-2 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] disabled:opacity-60"
                style={{
                  background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            {message && message.toLowerCase().includes("success") && (
              <p className="text-center text-gray-700 mt-4">
                <Link
                  to="/login"
                  className="font-semibold hover:underline"
                  style={{ color: "#0ea5e9" }}
                >
                  Back to login
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

