// src/services/activityLogger.js - PERFECT REAL ADMIN TRACKING
import { getAdminUser, getAdminToken } from '../utils/tokenUtils';

const ACTIVITY_LOG_KEY = 'ccms-activity-logs';
const MAX_LOGS = 500;
const LOG_RETENTION_DAYS = 90;

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

// ✅ ULTIMATE getCurrentAdmin - Uses FIXED tokenUtils
const getCurrentAdmin = () => {
  console.log('🔍 activityLogger.getCurrentAdmin()');
  
  // 1️⃣ Use FIXED tokenUtils (best source)
  const adminUser = getAdminUser();
  if (adminUser && adminUser.email) {
    console.log('✅ tokenUtils admin:', adminUser.name, adminUser.email);
    return {
      name: adminUser.name || adminUser.email.split('@')[0] || 'Admin',
      email: adminUser.email,
      role: adminUser.role || 'admin',
      userId: adminUser.userId || 'unknown'
    };
  }
  
  // 2️⃣ Emergency fallback (should never hit)
  console.warn('⚠️ No admin data - emergency fallback');
  return {
    name: 'Dashboard Admin',
    email: `admin@${window.location.host.replace(/:[0-9]+/, '')}`,
    role: 'Administrator',
    userId: `fallback-${Date.now()}`
  };
};

const getDeviceInfo = () => ({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  screenSize: `${window.screen.width}x${window.screen.height}`,
  viewport: `${window.innerWidth}x${window.innerHeight}`
});

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
        role: admin.role,
        userId: admin.userId
      },
      details,
      device,
      url: window.location.pathname + window.location.search,
      sessionId: getSessionId()
    };

    const logs = getAllLogs();
    logs.unshift(logEntry);
    const trimmedLogs = logs.slice(0, MAX_LOGS);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmedLogs));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Activity Logged:', {
        type,
        admin: `${admin.name} (${admin.email})`,
        details,
        timestamp: new Date().toLocaleString()
      });
    }
    
    return logEntry;
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    return null;
  }
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ccms-session-id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('ccms-session-id', sessionId);
  }
  return sessionId;
};

// ... rest of functions remain SAME (getAllLogs, exportLogsToCSV, etc.)
export const getAllLogs = () => {
  try {
    const logs = localStorage.getItem(ACTIVITY_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('❌ Failed to get logs:', error);
    return [];
  }
};

export const clearAllLogs = () => {
  if (window.confirm('⚠️ Delete ALL activity logs? This cannot be undone!')) {
    localStorage.removeItem(ACTIVITY_LOG_KEY);
    console.log('🗑️ All activity logs cleared');
    return true;
  }
  return false;
};

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
    
    if (logDate >= todayStart) stats.today++;
    if (logDate >= weekStart) stats.thisWeek++;
    if (logDate >= monthStart) stats.thisMonth++;
    
    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    const adminKey = log.admin.email;
    stats.byAdmin[adminKey] = (stats.byAdmin[adminKey] || 0) + 1;
  });
  
  stats.oldestLog = logs[logs.length - 1];
  stats.newestLog = logs[0];
  
  return stats;
};

export const exportLogsToCSV = (logs = null) => {
  const logsToExport = logs || getAllLogs();
  
  if (logsToExport.length === 0) {
    alert('No logs to export');
    return;
  }
  
  const headers = [
    'Timestamp', 'Type', 'Admin Name', 'Admin Email', 'Admin Role',
    'Details', 'URL', 'Platform', 'Screen', 'Session ID'
  ];
  
  const rows = logsToExport.map(log => [
    new Date(log.timestamp).toLocaleString('en-IN'),
    log.type,
    log.admin.name,
    log.admin.email,
    log.admin.role,
    JSON.stringify(log.details),
    log.url,
    log.device.platform,
    log.device.screenSize,
    log.sessionId
  ]);
  
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });
  
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
  URL.revokeObjectURL(url);
  
  console.log(`📥 Exported ${logsToExport.length} logs to ${filename}`);
};

export const initializeActivityLogger = () => {
  console.log('✅ Activity Logger initialized - Real admin tracking ENABLED');
};
