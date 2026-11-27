// src/hooks/useActivityLogger.js - COMPLETELY FIXED

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logActivity, ACTIVITY_TYPES } from '../services/activityLogger';

// Hook to auto-log page views
export const usePageViewLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName = getPageName(location.pathname);
    
    // ✅ FIXED: Use PAGE_VIEW, not COMPLAINT_VIEW!
    logActivity(ACTIVITY_TYPES.PAGE_VIEW, {
      page: pageName,
      path: location.pathname,
      action: `Viewed ${pageName} page`
    });
  }, [location.pathname]);
};

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

// Export for manual use
export { logActivity, ACTIVITY_TYPES };