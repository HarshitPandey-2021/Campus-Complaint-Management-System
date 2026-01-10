// src/App.jsx (Admin portal)

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

import {
  getAdminToken,
  getAdminUser,
  logoutAdmin,
} from "./utils/tokenUtils";

// Pages
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Analytics from "./pages/Analytics";
import ActivityLogs from "./pages/ActivityLogs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Helper for activity logging
function getPageName(path) {
  const routes = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/complaints": "Complaints",
    "/analytics": "Analytics",
    "/activity-logs": "Activity Logs",
    "/profile": "Profile",
  };
  return routes[path] || "Unknown Page";
}

// Strong admin-only guard
function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAdminToken();
  const user = getAdminUser();

  const isAdmin =
    !!token && !!user && (user.role === "admin" || user.role === "ADMIN");

  if (!isAdmin) {
    logoutAdmin();
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useKeyboardShortcuts();

  // Init local activity logger once
  useEffect(() => {
    initializeActivityLogger();
    logActivity(ACTIVITY_TYPES.LOGIN, {
      action: "Admin panel opened",
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

  // Close sidebar on mobile route change
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

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
        <div className="flex flex-col flex-1 min-h-screen transition-all duration-200">
          <Navbar toggleSidebar={toggleSidebar} />
          <Breadcrumb />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Routes>
              {/* Admin-only routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute>
                    <Complaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity-logs"
                element={
                  <ProtectedRoute>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Unauthorized page */}
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

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

// Root
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
