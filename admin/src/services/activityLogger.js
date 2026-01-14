// src/services/activityLogger.js
// Local activity logs (UI only, not auth)

import { getAdminUser } from "../utils/tokenUtils";

const ACTIVITY_LOG_KEY = "ccms-activity-logs";
const MAX_LOGS = 500;
const LOG_RETENTION_DAYS = 90; // reserved if you add pruning by age later

export const ACTIVITY_TYPES = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  STATUS_CHANGE: "STATUS_CHANGE",
  COMPLAINT_VIEW: "COMPLAINT_VIEW",
  COMPLAINT_EXPORT: "COMPLAINT_EXPORT",
  FILTER_APPLY: "FILTER_APPLY",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  BULK_ACTION: "BULK_ACTION",
  SETTINGS_CHANGE: "SETTINGS_CHANGE",
};

const getCurrentAdmin = () => {
  const adminUser = getAdminUser();
  if (adminUser && adminUser.email) {
    return {
      name: adminUser.name || adminUser.email.split("@")[0] || "Admin",
      email: adminUser.email,
      role: adminUser.role || "admin",
      userId: adminUser.userId || "unknown",
    };
  }

  // Fallback only for log display
  return {
    name: "Dashboard Admin",
    email: `admin@${window.location.host.replace(/:[0-9]+/, "")}`,
    role: "Administrator",
    userId: `fallback-${Date.now()}`,
  };
};

const getDeviceInfo = () => ({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  screenSize: `${window.screen.width}x${window.screen.height}`,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
});

const getSessionId = () => {
  let sessionId = sessionStorage.getItem("ccms-session-id");
  if (!sessionId) {
    sessionId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem("ccms-session-id", sessionId);
  }
  return sessionId;
};

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
        userId: admin.userId,
      },
      details,
      device,
      url: window.location.pathname + window.location.search,
      sessionId: getSessionId(),
    };

    const logs = getAllLogs();
    logs.unshift(logEntry);
    const trimmedLogs = logs.slice(0, MAX_LOGS);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmedLogs));

    return logEntry;
  } catch (error) {
    return null;
  }
};

export const getAllLogs = () => {
  try {
    const logs = localStorage.getItem(ACTIVITY_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
};

export const clearAllLogs = () => {
  if (window.confirm("Delete ALL activity logs? This cannot be undone!")) {
    localStorage.removeItem(ACTIVITY_LOG_KEY);
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
    newestLog: null,
  };

  if (!logs.length) return stats;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  logs.forEach((log) => {
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
  if (!logsToExport.length) {
    alert("No logs to export");
    return;
  }

  const headers = [
    "Timestamp",
    "Type",
    "Admin Name",
    "Admin Email",
    "Admin Role",
    "Details",
    "URL",
    "Platform",
    "Screen",
    "Session ID",
  ];

  const rows = logsToExport.map((log) => [
    new Date(log.timestamp).toLocaleString("en-IN"),
    log.type,
    log.admin.name,
    log.admin.email,
    log.admin.role,
    JSON.stringify(log.details),
    log.url,
    log.device.platform,
    log.device.screenSize,
    log.sessionId,
  ]);

  let csvContent = headers.join(",") + "\n";
  rows.forEach((row) => {
    csvContent +=
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",") + "\n";
  });

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const filename = `activity-logs-${new Date()
    .toISOString()
    .split("T")[0]}.csv`;

  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const initializeActivityLogger = () => {
  // Hook for future init logic
};
