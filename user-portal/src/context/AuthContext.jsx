import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // logged-in user object
  const [user, setUser] = useState(null);
  // auth flag
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // initial check in progress
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get("auth");

    console.log("AuthContext: checking auth...");
    console.log("AuthContext: auth param present:", !!authParam);

    // 1) Handle auth coming from landing page as ?auth=
    if (authParam) {
      try {
        const authData = JSON.parse(decodeURIComponent(authParam));
        console.log("AuthContext: decoded auth data from URL:", authData);

        // Expect token + user object
        if (authData.token && authData.user) {
          localStorage.setItem("token", authData.token);
          localStorage.setItem("user", JSON.stringify(authData.user));

          setUser(authData.user);
          setIsAuthenticated(true);
          console.log("AuthContext: session created from URL auth");
        } else {
          console.warn(
            "AuthContext: auth data missing token or user, ignoring URL auth"
          );
          setIsAuthenticated(false);
        }

        // Clean only the auth query param
        urlParams.delete("auth");
        const newQuery = urlParams.toString();
        const newUrl =
          window.location.pathname + (newQuery ? `?${newQuery}` : "");
        window.history.replaceState({}, document.title, newUrl);
        console.log("AuthContext: URL cleaned");
      } catch (err) {
        console.error("AuthContext: failed to parse auth from URL:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }

      // Stop here if authParam was present
      return;
    }

    // 2) If there is no ?auth=, check localStorage for existing session
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("AuthContext: checking localStorage:", {
      hasToken: !!token,
      hasUser: !!storedUser,
    });

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log("AuthContext: user restored from localStorage");
      } catch (err) {
        console.error("AuthContext: failed to parse user from localStorage:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("AuthContext: no auth in localStorage, user unauthenticated");
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  // Login helper for direct login from user-portal login page
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout helper
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    // Redirect back to main landing app
    window.location.href = "http://localhost:5174";
  };

  // Update user object in both state and localStorage
  const updateUser = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // While checking auth, show a loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Checking session...</div>
          <div className="text-sm text-slate-400">
            Please wait while we verify your login.
          </div>
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
