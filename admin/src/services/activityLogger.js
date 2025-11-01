// src/services/activityLogger.js - CREATE THIS NEW FILE

const ACTIVITY_LOG_KEY = 'ccms-activity-logs';
const MAX_LOGS = 500; // Keep last 500 logs
const LOG_RETENTION_DAYS = 90; // Auto-delete logs older than 90 days

// Activity types
export const ACTIVITY_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  STATUS_CHANGE: 'STATUS_CHANGE',
  COMPLAINT_VIEW: 'COMPLAINT_VIEW',
  COMPLAINT_EXPORT: 'COMPLAINT_EXPORT',
  FILTER_APPLY: 'FILTER_APPLY',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  BULK_ACTION: 'BULK_ACTION',
  SETTINGS_CHANGE: 'SETTINGS_CHANGE'
};

// Get current admin info (you can customize this)
const getCurrentAdmin = () => {
  const adminSession = localStorage.getItem('ccms-admin-session');
  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      return {
        name: session.name || 'Notwhite444',
        email: session.email || 'Notwhite444@lkouniv.edu',
        role: session.role || 'System Administrator'
      };
    } catch (e) {
      return {
        name: 'Notwhite444',
        email: 'Notwhite444@lkouniv.edu',
        role: 'System Administrator'
      };
    }
  }
  return {
    name: 'Notwhite444',
    email: 'Notwhite444@lkouniv.edu',
    role: 'System Administrator'
  };
};

// Get browser/device info
const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  };
};

// Main logging function
export const logActivity = (type, details = {}) => {
  try {
    const admin = getCurrentAdmin();
    const device = getDeviceInfo();
    
    const logEntry = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      details,
      device,
      url: window.location.pathname,
      sessionId: getSessionId()
    };

    // Get existing logs
    const logs = getAllLogs();
    
    // Add new log at the beginning
    logs.unshift(logEntry);
    
    // Trim to max logs
    const trimmedLogs = logs.slice(0, MAX_LOGS);
    
    // Save back
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmedLogs));
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Activity Logged:', logEntry);
    }
    
    return logEntry;
  } catch (error) {
    console.error('Failed to log activity:', error);
    return null;
  }
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ccms-session-id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('ccms-session-id', sessionId);
  }
  return sessionId;
};

// Get all logs
export const getAllLogs = () => {
  try {
    const logs = localStorage.getItem(ACTIVITY_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Failed to get logs:', error);
    return [];
  }
};

// Filter logs
export const filterLogs = (filters = {}) => {
  let logs = getAllLogs();
  
  // Filter by type
  if (filters.type && filters.type !== 'all') {
    logs = logs.filter(log => log.type === filters.type);
  }
  
  // Filter by admin
  if (filters.admin) {
    logs = logs.filter(log => 
      log.admin.name.toLowerCase().includes(filters.admin.toLowerCase()) ||
      log.admin.email.toLowerCase().includes(filters.admin.toLowerCase())
    );
  }
  
  // Filter by date range
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    logs = logs.filter(log => new Date(log.timestamp) >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    logs = logs.filter(log => new Date(log.timestamp) <= endDate);
  }
  
  // Search in details
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    logs = logs.filter(log => 
      JSON.stringify(log.details).toLowerCase().includes(searchLower) ||
      log.type.toLowerCase().includes(searchLower)
    );
  }
  
  return logs;
};

// Clean old logs
export const cleanOldLogs = () => {
  try {
    const logs = getAllLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);
    
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );
    
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(filteredLogs));
    
    const removedCount = logs.length - filteredLogs.length;
    console.log(`🗑️ Cleaned ${removedCount} old logs (older than ${LOG_RETENTION_DAYS} days)`);
    
    return removedCount;
  } catch (error) {
    console.error('Failed to clean logs:', error);
    return 0;
  }
};

// Export logs to CSV
export const exportLogsToCSV = (logs = null) => {
  const logsToExport = logs || getAllLogs();
  
  if (logsToExport.length === 0) {
    alert('No logs to export');
    return;
  }
  
  // CSV Headers
  const headers = [
    'Timestamp',
    'Type',
    'Admin Name',
    'Admin Email',
    'Admin Role',
    'Action Details',
    'URL',
    'User Agent',
    'Session ID'
  ];
  
  // CSV Rows
  const rows = logsToExport.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.type,
    log.admin.name,
    log.admin.email,
    log.admin.role,
    JSON.stringify(log.details),
    log.url,
    log.device.userAgent,
    log.sessionId
  ]);
  
  // Build CSV
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const filename = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`📥 Exported ${logsToExport.length} logs to ${filename}`);
};

// Clear all logs (dangerous!)
export const clearAllLogs = () => {
  if (window.confirm('⚠️ Are you sure you want to delete ALL activity logs? This cannot be undone!')) {
    localStorage.removeItem(ACTIVITY_LOG_KEY);
    console.log('🗑️ All activity logs cleared');
    return true;
  }
  return false;
};

// Get statistics
export const getLogStatistics = () => {
  const logs = getAllLogs();
  
  const stats = {
    total: logs.length,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byType: {},
    byAdmin: {},
    oldestLog: null,
    newestLog: null
  };
  
  if (logs.length === 0) return stats;
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  logs.forEach(log => {
    const logDate = new Date(log.timestamp);
    
    // Count by time period
    if (logDate >= todayStart) stats.today++;
    if (logDate >= weekStart) stats.thisWeek++;
    if (logDate >= monthStart) stats.thisMonth++;
    
    // Count by type
    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    
    // Count by admin
    const adminKey = log.admin.email;
    stats.byAdmin[adminKey] = (stats.byAdmin[adminKey] || 0) + 1;
  });
  
  stats.oldestLog = logs[logs.length - 1];
  stats.newestLog = logs[0];
  
  return stats;
};

// Initialize - run cleanup on load
export const initializeActivityLogger = () => {
  cleanOldLogs();
  console.log('✅ Activity Logger initialized');
};