// admin/src/components/AuthInitializer.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAdminSession, getAdminToken } from "../utils/tokenUtils.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function AuthInitializer({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const hasExchanged = useRef(false);

  useEffect(() => {
    async function initialize() {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      if (!code) {
        const existingToken = getAdminToken();
        console.log("🔵 AuthInitializer: No code, existing token:", existingToken ? "exists" : "none");
        setIsReady(true);
        return;
      }

      if (hasExchanged.current) {
        console.log("⚠️ Code already exchanged, skipping");
        setIsReady(true);
        return;
      }

      hasExchanged.current = true;
      console.log("🔵 AuthInitializer: Code found, exchanging...");

      try {
        const response = await fetch(`${API_BASE}/auth/exchange-admin-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "Code exchange failed");
        }

        const { token, refreshToken, user } = await response.json();

        console.log("🔵 AuthInitializer: Exchange successful");
        console.log("  - User:", user.name, user.email);
        console.log("  - Role:", user.role);

        if (!token || !user || user.role !== "admin") {
          throw new Error("Invalid admin session data");
        }

        saveAdminSession(token, refreshToken || null, user);

        console.log("✅ AuthInitializer: Session saved to localStorage");

        navigate("/dashboard", { replace: true });

      } catch (err) {
        console.error("❌ AuthInitializer: Exchange failed:", err);
        
        // If code already used, check if we have valid session
        const existingToken = getAdminToken();
        if (existingToken) {
          console.log("✅ Valid session exists, proceeding");
          navigate("/dashboard", { replace: true });
        } else {
          setError(err.message || "Session initialization failed");
        }
      } finally {
        setIsReady(true);
      }
    }

    initialize();
  }, []); // Empty deps - only run once

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg font-semibold">
            Initializing admin session...
          </p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Session Error
            </h2>
            <p className="text-gray-300">{error}</p>
          </div>
          <a
            href="https://ccms-home.vercel.app/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-block font-semibold"
          >
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return children;
}
