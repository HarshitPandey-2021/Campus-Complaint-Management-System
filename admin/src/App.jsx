// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Breadcrumb from './components/Breadcrumb';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { ToastProvider } from './context/ToastContext';
import { initializeActivityLogger, logActivity, ACTIVITY_TYPES } from './services/activityLogger';

// Import Pages
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import Analytics from './pages/Analytics';
import ActivityLogs from './pages/ActivityLogs';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Main App Content
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize activity logger on mount
  useEffect(() => {
    initializeActivityLogger();
    // Log initial app load
    logActivity(ACTIVITY_TYPES.LOGIN, {
      action: 'Application Started',
      timestamp: new Date().toISOString()
    });
  }, []);

  // ✅ ADD THIS - Log page navigation
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
      page: pageName,
      path: location.pathname,
      action: 'Navigated to page'
    });
  }, [location.pathname]);

  // Helper to get page name
  const getPageName = (path) => {
    const routes = {
      '/': 'Dashboard',
      '/complaints': 'Complaints',
      '/analytics': 'Analytics',
      '/activity-logs': 'Activity Logs',
      '/profile': 'Profile'
    };
    return routes[path] || 'Unknown Page';
  };

  // Close sidebar on route change (mobile only)
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Fixed Navbar */}
      <Navbar onMenuToggle={toggleSidebar} />
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb Navigation */}
          <Breadcrumb />
          
          {/* Routes */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}

export default App;