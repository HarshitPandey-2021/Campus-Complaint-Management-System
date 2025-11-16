// src/hooks/useActivityLogger.js - CREATE THIS NEW FILE

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logActivity, ACTIVITY_TYPES } from '../services/activityLogger';

// Hook to auto-log page views
export const usePageViewLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName = getPageName(location.pathname);
    
    logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
      page: pageName,
      path: location.pathname,
      action: 'Page Visit'
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

// Export the logging function for manual use
export { logActivity, ACTIVITY_TYPES };