// src/context/AuthContext.jsx - COMPLETE
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (data) => {
    setUser(data);
    
    // ✅ If admin login, save to localStorage properly
    if (data?.user?.role === "admin" && data?.token) {
      console.log("🔑 AuthContext: Saving admin session to localStorage");
      
      const cleanUser = {
        name: data.user.name || data.user.email?.split("@")[0] || "Admin",
        email: data.user.email,
        role: data.user.role,
        userId: data.user._id || data.user.id,
      };

      // Save in multiple keys for compatibility
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("ccms-admin-token", data.token);
      localStorage.setItem("ccms-admin-session", JSON.stringify(cleanUser));
      localStorage.setItem("adminUser", JSON.stringify(cleanUser));
      localStorage.setItem("adminProfile", JSON.stringify(cleanUser));
      localStorage.setItem("user", JSON.stringify(cleanUser));
      
      // Save refresh token if available
      if (data.refreshToken) {
        localStorage.setItem("adminRefreshToken", data.refreshToken);
        console.log("✅ Refresh token saved");
      }
      
      console.log("✅ Admin session saved to localStorage");
    }
  };

  const logout = () => {
    setUser(null);
    
    // Clear admin session from localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("ccms-admin-token");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("ccms-admin-session");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminProfile");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("adminRefreshToken");
    
    console.log("🚪 AuthContext: Admin session cleared");
  };

  const signup = (data) => {
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
