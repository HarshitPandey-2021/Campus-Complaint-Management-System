// src/App.jsx (admin - 5173) - FIXED VERSION
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Breadcrumb from "./components/Breadcrumb";

import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { ToastProvider } from "./context/ToastContext";
import {
  initializeActivityLogger,
  logActivity,
  ACTIVITY_TYPES,
} from "./services/activityLogger";

// Pages
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Analytics from "./pages/Analytics";
import ActivityLogs from "./pages/ActivityLogs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

/* ------------------ URL → localStorage (auth) ------------------ */

function useAuthFromQuery() {
  const location = useLocation();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authParam = params.get("auth");

    if (!authParam) {
      // No auth param → just mark as ready
      setAuthReady(true);
      return;
    }

    try {
      const { token, user } = JSON.parse(decodeURIComponent(authParam));
      console.log("✅ Parsed auth from URL:", { token, user });

      if (token && user) {
        // ✅ Save token in all expected keys for admin portal
        localStorage.setItem("adminToken", token);
        localStorage.setItem("token", token);
        localStorage.setItem("authToken", token);

        // ✅ Cache user in multiple keys for compatibility
        localStorage.setItem("adminProfile", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("ccms-admin-session", JSON.stringify(user));
        
        console.log("✅ Token saved to localStorage");
      }
    } catch (e) {
      console.error("❌ Invalid auth data in URL", e);
    } finally {
      // Remove ?auth from URL to keep clean URLs after first load
      params.delete("auth");
      const newQuery = params.toString();
      const newUrl = location.pathname + (newQuery ? `?${newQuery}` : "");
      window.history.replaceState({}, "", newUrl);

      // ✅ Mark auth as processed
      setAuthReady(true);
    }
  }, [location.search, location.pathname]);

  return authReady;
}

/* ------------------ ✅ FIXED ProtectedRoute ------------------ */

function ProtectedRoute({ children, authReady }) {
  // ✅ Check multiple token sources
  const token = 
    localStorage.getItem("token") || 
    localStorage.getItem("adminToken") || 
    localStorage.getItem("authToken");

  // ✅ Also check if user data exists
  const user = 
    localStorage.getItem("user") || 
    localStorage.getItem("adminProfile");

  console.log("🔒 ProtectedRoute:", {
    authReady,
    hasToken: !!token,
    hasUser: !!user,
    tokenPreview: token ? token.substring(0, 20) + "..." : "none"
  });

  // Wait until URL auth is processed
  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  // ✅ Check both token AND user data
  if (!token || !user) {
    console.error("❌ Missing credentials:", {
      token: !!token,
      user: !!user
    });
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ All checks passed
  console.log("✅ Access granted");
  return children;
}

/* ------------------ MAIN APP CONTENT ------------------ */

const AppContent = () => {
  const authReady = useAuthFromQuery(); // ✅ Get auth ready status

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useKeyboardShortcuts();

  // Initialize activity logger on mount
  useEffect(() => {
    initializeActivityLogger();
    logActivity(ACTIVITY_TYPES.LOGIN, {
      action: "Application Started",
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Log page navigation
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
      page: pageName,
      path: location.pathname,
      action: "Navigated to page",
    });
  }, [location.pathname]);

  const getPageName = (path) => {
    const routes = {
      "/": "Dashboard",
      "/complaints": "Complaints",
      "/analytics": "Analytics",
      "/activity-logs": "Activity Logs",
      "/profile": "Profile",
    };
    return routes[path] || "Unknown Page";
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Open sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-h-screen transition-all">
          <Navbar toggleSidebar={toggleSidebar} />
          <Breadcrumb />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute authReady={authReady}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute authReady={authReady}>
                    <Complaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute authReady={authReady}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity-logs"
                element={
                  <ProtectedRoute authReady={authReady}>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute authReady={authReady}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* unauthorized fallback */}
              <Route
                path="/unauthorized"
                element={
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-2xl font-semibold mb-2">
                      Unauthorized
                    </h1>
                    <p className="text-gray-600 mb-4">
                      Please login from the student portal as admin to access
                      this panel.
                    </p>
                    <a
                      href="http://localhost:5174/login"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Go to Login
                    </a>
                  </div>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

/* ------------------ ROOT APP ------------------ */

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
