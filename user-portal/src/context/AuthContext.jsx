import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get("auth");

    if (authParam) {
      try {
        const authData = JSON.parse(decodeURIComponent(authParam));

        if (!authData.token || !authData.user) {
          throw new Error("Missing token or user");
        }

        if (authData.user.role !== "student") {
          throw new Error("Student access only");
        }

        const EXPIRY_MS = 5 * 60 * 1000;
        if (!authData.timestamp || Date.now() - authData.timestamp > EXPIRY_MS) {
          throw new Error("Auth link expired, please login again.");
        }

        localStorage.setItem("token", authData.token);
        if (authData.refreshToken) {
          localStorage.setItem("refreshToken", authData.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(authData.user));

        setUser(authData.user);
        setIsAuthenticated(true);

        urlParams.delete("auth");
        const newUrl = `${window.location.pathname}${
          urlParams.toString() ? `?${urlParams.toString()}` : ""
        }`;
        window.history.replaceState({}, document.title, newUrl);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "student") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        } else {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  function login(userData, token, refreshToken = null) {
    if (!userData || userData.role !== "student") {
      throw new Error("Student access only");
    }

    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "https://ccms-home.vercel.app/";
  }

  function updateUser(updates) {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  }

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
}
