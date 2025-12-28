// src/pages/ActivityLogs.jsx - ADMIN NAME/DETAILS FIXED
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import {
  getAllLogs,
  exportLogsToCSV,
  clearAllLogs,
  getLogStatistics,
  ACTIVITY_TYPES,
  logActivity, // ADD THIS
} from "../services/activityLogger";
import { getAdminToken } from "../utils/tokenUtils";
import {
  RiHistoryLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiEyeLine,
  RiCloseLine,
  RiFilterOffLine,
  RiFileTextLine,
  RiUserLine,
} from "react-icons/ri";

const ActivityLogs = () => {
  const { success, error } = useToast();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");

  const token = getAdminToken() || localStorage.getItem("token");

  // ✅ FIXED: Generate test log on load
  useEffect(() => {
    // Auto-generate test log when page loads
    logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
      page: 'Activity Logs',
      action: 'Viewed activity logs page'
    });
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading activity logs...');
      
      const allLogs = getAllLogs();
      console.log('📊 Total logs:', allLogs.length);
      console.log('📋 First log admin:', allLogs[0]?.admin); // DEBUG
      
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      setStats(getLogStatistics(allLogs));
      
    } catch (err) {
      console.error("❌ Load error:", err);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const applyFilters = (logsToFilter, currentFilters, quickFilter) => {
    try {
      let filtered = [...(logsToFilter || [])];

      if (quickFilter !== "all") {
        filtered = filtered.filter((log) => log?.type === quickFilter);
      }

      if (currentFilters.search?.trim()) {
        const searchLower = currentFilters.search.toLowerCase();
        filtered = filtered.filter((log) =>
          (log?.admin?.name || '').toLowerCase().includes(searchLower) ||
          (log?.admin?.email || '').toLowerCase().includes(searchLower) ||
          (log?.type || '').toLowerCase().includes(searchLower) ||
          JSON.stringify(log?.details || {}).toLowerCase().includes(searchLower)
        );
      }

      if (currentFilters.startDate) {
        const startDate = new Date(currentFilters.startDate);
        filtered = filtered.filter((log) => new Date(log?.timestamp) >= startDate);
      }

      if (currentFilters.endDate) {
        const endDate = new Date(currentFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((log) => new Date(log?.timestamp) <= endDate);
      }

      setFilteredLogs(filtered);
    } catch (err) {
      console.error('Filter error:', err);
      setFilteredLogs(logs);
    }
  };

  useEffect(() => {
    applyFilters(logs, filters, activeQuickFilter);
  }, [filters, activeQuickFilter, logs]);

  const handleQuickFilter = (filterType) => {
    setActiveQuickFilter(filterType);
    logActivity(ACTIVITY_TYPES.FILTER_APPLY, { filter: filterType });
  };

  const handleResetFilters = () => {
    setFilters({ search: "", startDate: "", endDate: "" });
    setActiveQuickFilter("all");
  };

  const handleExport = () => {
    logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, { 
      count: filteredLogs.length,
      action: 'Exported activity logs'
    });
    exportLogsToCSV(filteredLogs);
    success(`Exported ${filteredLogs.length} logs`);
  };

  const handleClearAll = async () => {
    if (window.confirm("Delete ALL logs?")) {
      logActivity(ACTIVITY_TYPES.BULK_ACTION, { action: 'Cleared all activity logs' });
      clearAllLogs();
      await loadLogs();
      success("Logs cleared");
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.LOGIN:
      case ACTIVITY_TYPES.LOGOUT:
        return <RiUserLine className="h-5 w-5" />;
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return <RiCheckboxCircleLine className="h-5 w-5" />;
      case ACTIVITY_TYPES.COMPLAINT_VIEW:
        return <RiFileTextLine className="h-5 w-5" />;
      case ACTIVITY_TYPES.COMPLAINT_EXPORT:
      case ACTIVITY_TYPES.FILTER_APPLY:
        return <RiDownloadLine className="h-5 w-5" />;
      default:
        return <RiAlertLine className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.LOGIN:
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
      case ACTIVITY_TYPES.COMPLAINT_VIEW:
      case ACTIVITY_TYPES.FILTER_APPLY:
        return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
      case ACTIVITY_TYPES.COMPLAINT_EXPORT:
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400";
    }
  };

  // ✅ FIXED: Safe admin name display
  const getAdminDisplay = (log) => {
    const admin = log?.admin || {};
    const name = admin.name || admin.email?.split('@')[0] || 'Unknown Admin';
    const email = admin.email || 'N/A';
    return { name, email };
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getActivitySummary = (log) => {
    try {
      const { details, type } = log || {};
      switch (type) {
        case ACTIVITY_TYPES.STATUS_CHANGE:
          return `Status changed: ${details?.previousStatus || '?'} → ${details?.newStatus || '?'}`;
        case ACTIVITY_TYPES.COMPLAINT_VIEW:
          return `Viewed: ${details?.page || 'complaint'}`;
        case ACTIVITY_TYPES.LOGIN:
          return `Admin login`;
        case ACTIVITY_TYPES.FILTER_APPLY:
          return `Applied filter: ${details?.filter || 'unknown'}`;
        case ACTIVITY_TYPES.COMPLAINT_EXPORT:
          return `Exported ${details?.count || 0} logs`;
        default:
          return type || "Activity";
      }
    } catch {
      return "Activity log";
    }
  };

  const openModal = (log) => {
    logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, { logId: log?.id });
    setSelectedLog(log);
    setShowModal(true);
  };

  const hasActiveFilters = filters.search || filters.startDate || filters.endDate || activeQuickFilter !== "all";

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-0 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <RiHistoryLine className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Activity Logs</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Complete admin audit trail</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.today}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.thisWeek}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.thisMonth}</p>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Quick Filters</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Status', value: ACTIVITY_TYPES.STATUS_CHANGE },
              { label: 'Views', value: ACTIVITY_TYPES.COMPLAINT_VIEW },
              { label: 'Filters', value: ACTIVITY_TYPES.FILTER_APPLY },
              { label: 'Login', value: ACTIVITY_TYPES.LOGIN },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleQuickFilter(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeQuickFilter === value
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all shadow-sm"
            >
              <RiDownloadLine className="h-4 w-4" />
              Export ({filteredLogs.length})
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm"
            >
              <RiDeleteBinLine className="h-4 w-4" />
              Clear All
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900/50 dark:to-gray-800/50">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Activity ({filteredLogs.length} of {logs.length})
            </h3>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">
              Live Data
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
            <p className="text-xl font-medium text-gray-600 dark:text-gray-400">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-gray-500 dark:text-gray-400">
            <RiHistoryLine className="h-20 w-20 mx-auto mb-6 opacity-40" />
            <p className="text-2xl font-bold mb-3">No activity logs yet</p>
            <p className="text-lg mb-6">Use admin features to generate logs</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleExport} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                Generate Test Log
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50 max-h-[70vh] overflow-y-auto">
            {filteredLogs.slice(0, 50).map((log, index) => {
              const adminInfo = getAdminDisplay(log);
              return (
                <div key={log.id || index} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all group">
                  <div className="flex items-start gap-4">
                    {/* Activity Icon */}
                    <div className={`p-3 rounded-xl flex-shrink-0 shadow-sm ${getActivityColor(log.type)}`}>
                      {getActivityIcon(log.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-8 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {getActivitySummary(log)}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                          {adminInfo.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 hidden md:inline">
                          • {formatDate(log.timestamp)}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {log.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {adminInfo.email}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openModal(log)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 hover:scale-110"
                      title="View full details"
                    >
                      <RiEyeLine className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="sticky top-0 p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-lg ${getActivityColor(selectedLog.type)}`}>
                      {getActivityIcon(selectedLog.type)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Activity Details
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLog.type}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all hover:scale-105"
                  >
                    <RiCloseLine className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Summary</h3>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {getActivitySummary(selectedLog)}
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    {formatDate(selectedLog.timestamp)}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Admin Info */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-8 rounded-2xl border">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-3">
                      <RiUserLine className="h-5 w-5" />
                      Admin
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</span>
                        <p className="text-xl font-bold mt-1">{getAdminDisplay(selectedLog).name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                        <p className="text-sm text-gray-900 dark:text-white font-mono break-all mt-1">
                          {getAdminDisplay(selectedLog).email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 p-8 rounded-2xl border">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-3">
                      <RiFileTextLine className="h-5 w-5" />
                      Device & Session
                    </h4>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Platform</span>
                        <p className="mt-1">{selectedLog.device?.platform || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Screen</span>
                        <p className="mt-1">{selectedLog.device?.screenSize || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Session</span>
                        <p className="mt-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                          {selectedLog.sessionId || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
