import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Breadcrumb from "./components/Breadcrumb.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts.js";
import { ToastProvider } from "./context/ToastContext.jsx";
import {
  initializeActivityLogger,
  logActivity,
  ACTIVITY_TYPES,
} from "./services/activityLogger.js";
import {
  getAdminToken,
  getAdminUser,
  logoutAdmin,
} from "./utils/tokenUtils.js";
import Dashboard from "./pages/Dashboard.jsx";
import Complaints from "./pages/Complaints.jsx";
import Analytics from "./pages/Analytics.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

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

// ✅ NEW: Handle refresh 404 issue
function RouteHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we're on an invalid route on page load
    const validRoutes = ['/', '/dashboard', '/complaints', '/analytics', '/activity-logs', '/profile', '/unauthorized'];
    const currentPath = window.location.pathname;
    
    // If route is not valid and we have auth, redirect to dashboard
    if (!validRoutes.includes(currentPath)) {
      const token = getAdminToken();
      if (token) {
        console.log('🔄 Invalid route detected, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);
  
  return null;
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAdminToken();
  const user = getAdminUser();

  const isAdmin = !!token && !!user && user.role === "admin";

  if (!isAdmin) {
    console.log("❌ ProtectedRoute: Not admin, redirecting to /unauthorized");
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  console.log("✅ ProtectedRoute: Admin verified");
  return children;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useKeyboardShortcuts();

  useEffect(() => {
    initializeActivityLogger();
    logActivity(ACTIVITY_TYPES.LOGIN, {
      page: "Admin Dashboard",
      action: "Admin panel opened",
      timestamp: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    const pageName = getPageName(location.pathname);
    logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
      page: pageName,
      path: location.pathname,
      action: "Navigated to page",
    });
  }, [location.pathname]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  return (
    <ToastProvider>
      <RouteHandler /> {/* ✅ NEW: Add this */}
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 min-h-screen transition-all duration-200">
          <Navbar toggleSidebar={toggleSidebar} />
          <Breadcrumb />
          <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="p-4 md:p-6 lg:p-8">
            <Routes>
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
              <Route
                path="/unauthorized"
                element={
                  <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-900">
                    <h1 className="text-3xl font-semibold mb-4 text-white">
                      Unauthorized Access
                    </h1>
                    <p className="text-gray-400 mb-6 max-w-md">
                      You need to login as an admin from the main portal to access this panel.
                    </p>
                    <a
                      href="https://ccms-home.vercel.app/"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      Go to home
                    </a>
                  </div>
                }
              />
              {/* ✅ NEW: Catch all invalid routes */}
              <Route 
                path="*" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/" replace />
                  </ProtectedRoute>
                }
              />
            </Routes>
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthInitializer>
        <AppContent />
      </AuthInitializer>
    </Router>
  );
}