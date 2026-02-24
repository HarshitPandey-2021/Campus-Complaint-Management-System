// src/App.jsx - EMERGENCY FIX

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Breadcrumb from "./components/Breadcrumb.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts.js";
import { ToastProvider } from "./context/ToastContext.jsx";
import { usePageViewLogger } from "./hooks/useActivityLogger.js";
import {
  initializeActivityLogger,
  logActivity,
  ACTIVITY_TYPES,
} from "./services/activityLogger.js";
import {
  getAdminToken,
  getAdminUser,
} from "./utils/tokenUtils.js";
import Dashboard from "./pages/Dashboard.jsx";
import Complaints from "./pages/Complaints.jsx";
import Analytics from "./pages/Analytics.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";
import Profile from "./pages/Profile.jsx";

// ✅ Get home URL based on environment
function getHomeURL() {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  return isLocalhost 
    ? 'http://localhost:5174'
    : 'https://ccms-home.vercel.app/';
}

// ✅ Route Handler - Fixes refresh 404
function RouteHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const validRoutes = ['/', '/dashboard', '/complaints', '/analytics', '/activity-logs', '/profile', '/unauthorized'];
    const currentPath = window.location.pathname;
    
    if (!validRoutes.includes(currentPath)) {
      const token = getAdminToken();
      if (token) {
        console.log('🔄 Invalid route, redirecting to dashboard');
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);
  
  return null;
}

// ✅ FIXED: Simplified ProtectedRoute - Just check if token and user exist
function ProtectedRoute({ children }) {
  const token = getAdminToken();
  const user = getAdminUser();

  // ✅ FIXED: Just check if authenticated (backend already verified admin role)
  const isAuthenticated = !!token && !!user;

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ ProtectedRoute: User authenticated:", user?.name, user?.email);
  return children;
}

// ✅ Main App Content
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useKeyboardShortcuts();
  usePageViewLogger(); // ✅ Automatically logs page views

  // ✅ Initialize activity logger ONCE on mount
  useEffect(() => {
    initializeActivityLogger();
    
    // Only log login once when app first loads
    const hasLoggedLogin = sessionStorage.getItem('login-logged');
    if (!hasLoggedLogin) {
      const user = getAdminUser();
      logActivity(ACTIVITY_TYPES.LOGIN, {
        action: "Admin panel opened",
        adminName: user?.name || "Admin",
        timestamp: new Date().toISOString(),
      });
      sessionStorage.setItem('login-logged', 'true');
    }
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle sidebar state based on screen size
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
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
      <RouteHandler />
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 min-h-screen">
          <Navbar toggleSidebar={toggleSidebar} />
          <Breadcrumb />
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Unauthorized Page */}
              <Route
                path="/unauthorized"
                element={
                  <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-900 p-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-white">
                      Unauthorized Access
                    </h1>
                    <p className="text-gray-400 mb-6 max-w-md text-sm sm:text-base">
                      You need to login as an admin from the main portal to access this panel.
                    </p>
                    <a
                      href={getHomeURL()}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      Go to Home Portal
                    </a>
                  </div>
                }
              />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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