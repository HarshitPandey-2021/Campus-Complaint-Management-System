// src/App.jsx (admin - 5173)
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
      setAuthReady(true);
      return;
    }

    try {
      const { token, user } = JSON.parse(decodeURIComponent(authParam));
      console.log("✅ Parsed auth from URL:", { token, user });

      if (token && user) {
        // Admin origin ke localStorage me token + user save
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (e) {
      console.error("Invalid auth data in URL", e);
    } finally {
      // URL se ?auth hata do
      params.delete("auth");
      const newQuery = params.toString();
      const newUrl = location.pathname + (newQuery ? `?${newQuery}` : "");
      window.history.replaceState({}, "", newUrl);
      
      // ✅ Mark auth as ready after processing
      setAuthReady(true);
    }
  }, [location.search, location.pathname]);

  return authReady;
}

/* ------------------ ProtectedRoute (localStorage token) ------------------ */

function ProtectedRoute({ children, authReady }) {
  const token = localStorage.getItem("token");

  // ✅ Wait for auth to be processed
  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/unauthorized" replace />;
  }

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
