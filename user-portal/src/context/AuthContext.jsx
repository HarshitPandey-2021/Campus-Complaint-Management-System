// user-portal/src/context/AuthContext.jsx - WITH REFRESH TOKEN SUPPORT
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 User AuthContext: checking session...");

    // Check for one-time auth param from landing
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get("auth");

    if (authParam) {
      console.log("🔗 Processing auth from URL...");
      try {
        const authData = JSON.parse(decodeURIComponent(authParam));

        if (!authData.token || !authData.user) {
          throw new Error("Missing token or user");
        }

        if (authData.user.role !== "student") {
          console.error("❌ Non-student role:", authData.user.role);
          throw new Error("Student access only");
        }

        // Check timestamp
        const AUTH_EXPIRY = 5 * 60 * 1000;
        if (authData.timestamp && Date.now() - authData.timestamp > AUTH_EXPIRY) {
          console.warn("⚠️ Auth data expired");
          throw new Error("Auth link expired, please login again");
        }

        // Save BOTH tokens
        localStorage.setItem("token", authData.token);
        if (authData.refreshToken) {
          localStorage.setItem("refreshToken", authData.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(authData.user));

        setUser(authData.user);
        setIsAuthenticated(true);

        console.log("✅ Session created from URL:", authData.user.email);

        // Clean URL
        urlParams.delete("auth");
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "");
        window.history.replaceState({}, document.title, newUrl);
        console.log("🧹 URL cleaned");
      } catch (err) {
        console.error("❌ Failed to process auth from URL:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Check localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser.role !== "student") {
          console.warn("⚠️ Non-student token, clearing");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        } else {
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("✅ Session restored from localStorage:", parsedUser.email);
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    } else {
      console.log("⚠️ No session found");
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  const login = (userData, token, refreshToken = null) => {
    if (userData.role !== "student") {
      console.error("❌ Attempted login with non-student account");
      throw new Error("Student access only");
    }
    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("🚪 Logging out student...");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "http://localhost:5174";
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

