// src/pages/ActivityLogs.jsx - FIXED: Removed wrong COMPLAINT_VIEW logging

import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { exportToExcel } from "../utils/exportUtils";
import {
  getAllLogs,
  clearAllLogs,
  getLogStatistics,
  ACTIVITY_TYPES,
  logActivity,
} from "../services/activityLogger";
import {
  RiHistoryLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiCloseLine,
  RiFileTextLine,
  RiUserLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
  RiFilterLine,
  RiLockLine,
  RiPagesLine,
} from "react-icons/ri";

const ActivityLogs = () => {
  const { success, error } = useToast();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");

  const loadLogs = () => {
    try {
      setLoading(true);
      const allLogs = getAllLogs();
      console.log("📊 Loaded logs:", allLogs.length, allLogs.slice(0, 3));
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      setStats(getLogStatistics(allLogs));
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sirf logs load, yahan koi logging nahi
  useEffect(() => {
    loadLogs();
  }, []);

  // Filters apply
  useEffect(() => {
    let filtered = [...logs];

    if (activeQuickFilter !== "all") {
      filtered = filtered.filter((log) => log?.type === activeQuickFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          (log?.admin?.name || "").toLowerCase().includes(term) ||
          (log?.admin?.email || "").toLowerCase().includes(term) ||
          getActivityLabel(log?.type).toLowerCase().includes(term) ||
          getActivitySummary(log).toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  }, [searchTerm, activeQuickFilter, logs]);

  const handleExport = async () => {
    try {
      logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, {
        count: filteredLogs.length,
        action: "Exported activity logs",
      });

      const filename = `activity_logs_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;

      await exportToExcel(filteredLogs, filename);

      success(`✅ Exported ${filteredLogs.length} logs to Excel`);
    } catch (err) {
      console.error("Export error:", err);
      error("❌ Failed to export activity logs");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Delete ALL logs? This cannot be undone!")) {
      clearAllLogs();
      loadLogs();
      success("Logs cleared");
    }
  };

  // ✅ Correct icon for each type
  const getActivityIcon = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.LOGIN:
        return <RiLoginCircleLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.LOGOUT:
        return <RiLogoutCircleLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.PAGE_VIEW:
        return <RiPagesLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return <RiCheckboxCircleLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.COMPLAINT_VIEW:
        return <RiEyeLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.COMPLAINT_EXPORT:
        return <RiDownloadLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.FILTER_APPLY:
        return <RiFilterLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.PROFILE_UPDATE:
        return <RiUserLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      case ACTIVITY_TYPES.PASSWORD_CHANGE:
        return <RiLockLine className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <RiFileTextLine className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  // ✅ Correct colors for each type
  const getActivityColor = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.LOGIN:
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case ACTIVITY_TYPES.LOGOUT:
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case ACTIVITY_TYPES.PAGE_VIEW:
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case ACTIVITY_TYPES.COMPLAINT_VIEW:
        return "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30";
      case ACTIVITY_TYPES.COMPLAINT_EXPORT:
        return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30";
      case ACTIVITY_TYPES.FILTER_APPLY:
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
      case ACTIVITY_TYPES.PROFILE_UPDATE:
        return "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30";
      case ACTIVITY_TYPES.PASSWORD_CHANGE:
        return "text-pink-600 bg-pink-100 dark:bg-pink-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  // ✅ Human-readable labels
  const getActivityLabel = (type) => {
    const labels = {
      [ACTIVITY_TYPES.LOGIN]: "Login",
      [ACTIVITY_TYPES.LOGOUT]: "Logout",
      [ACTIVITY_TYPES.PAGE_VIEW]: "Page View",
      [ACTIVITY_TYPES.STATUS_CHANGE]: "Status Change",
      [ACTIVITY_TYPES.COMPLAINT_VIEW]: "Viewed Complaint",
      [ACTIVITY_TYPES.COMPLAINT_EXPORT]: "Export",
      [ACTIVITY_TYPES.FILTER_APPLY]: "Filter Applied",
      [ACTIVITY_TYPES.PROFILE_UPDATE]: "Profile Update",
      [ACTIVITY_TYPES.PASSWORD_CHANGE]: "Password Change",
      [ACTIVITY_TYPES.BULK_ACTION]: "Bulk Action",
    };
    return labels[type] || type || "Activity";
  };

  // ✅ Correct summary based on type
  const getActivitySummary = (log) => {
    if (!log) return "Activity";

    const { details, type } = log;

    switch (type) {
      case ACTIVITY_TYPES.LOGIN:
        return "Admin logged in to dashboard";
      case ACTIVITY_TYPES.LOGOUT:
        return "Admin logged out";
      case ACTIVITY_TYPES.PAGE_VIEW:
        return `Viewed ${details?.page || "page"}`;
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return `Changed status: ${details?.previousStatus || "?"} → ${
          details?.newStatus || "?"
        }`;
      case ACTIVITY_TYPES.COMPLAINT_VIEW: {
        const title =
          details?.complaintTitle || details?.title || details?.subject;
        return title
          ? `Viewed: ${title}`
          : `Viewed complaint #${details?.complaintId || "unknown"}`;
      }
      case ACTIVITY_TYPES.FILTER_APPLY:
        return `Applied filter: ${
          details?.filter || details?.status || "custom"
        }`;
      case ACTIVITY_TYPES.COMPLAINT_EXPORT:
        return `Exported ${
          details?.count || details?.complaintCount || 0
        } items`;
      case ACTIVITY_TYPES.PROFILE_UPDATE:
        return details?.action || "Updated profile";
      case ACTIVITY_TYPES.PASSWORD_CHANGE:
        return "Changed password";
      case ACTIVITY_TYPES.BULK_ACTION:
        return details?.action || "Performed bulk action";
      default:
        return details?.action || getActivityLabel(type);
    }
  };

  const getAdminDisplay = (log) => ({
    name:
      log?.admin?.name || log?.admin?.email?.split("@")[0] || "Admin",
    email: log?.admin?.email || "N/A",
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid";
    }
  };

  const hasActiveFilters = searchTerm || activeQuickFilter !== "all";

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <RiHistoryLine className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
              Activity Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Complete admin audit trail
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[
              { label: "Total", value: stats.total, color: "text-gray-900" },
              { label: "Today", value: stats.today, color: "text-green-600" },
              {
                label: "This Week",
                value: stats.thisWeek,
                color: "text-blue-600",
              },
              {
                label: "This Month",
                value: stats.thisMonth,
                color: "text-purple-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border"
              >
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p
                  className={`text-lg sm:text-xl lg:text-2xl font-bold ${stat.color} dark:text-gray-200 mt-1`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1 relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-medium"
              >
                <RiDownloadLine className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium"
              >
                <RiDeleteBinLine className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Page Views", value: ACTIVITY_TYPES.PAGE_VIEW },
              { label: "Complaints", value: ACTIVITY_TYPES.COMPLAINT_VIEW },
              { label: "Status", value: ACTIVITY_TYPES.STATUS_CHANGE },
              { label: "Exports", value: ACTIVITY_TYPES.COMPLAINT_EXPORT },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveQuickFilter(value)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeQuickFilter === value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveQuickFilter("all");
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              {filteredLogs.length} Activities
            </h3>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <RiHistoryLine className="h-12 w-12 mx-auto mb-4 opacity-40 text-gray-400" />
              <p className="font-medium text-gray-600 dark:text-gray-400">
                No activity logs
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Activities will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
              {filteredLogs.slice(0, 100).map((log, index) => {
                const adminInfo = getAdminDisplay(log);
                return (
                  <div
                    key={log.id || index}
                    className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Icon */}
                      <div
                        className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 ${getActivityColor(
                          log.type
                        )}`}
                      >
                        {getActivityIcon(log.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {getActivitySummary(log)}
                          </h4>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getActivityColor(
                              log.type
                            )}`}
                          >
                            {getActivityLabel(log.type)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs text-gray-500">
                          <span className="font-medium">
                            {adminInfo.name}
                          </span>
                          <span>•</span>
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <RiEyeLine className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedLog && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 p-4 sm:p-5 border-b bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${getActivityColor(
                        selectedLog.type
                      )}`}
                    >
                      {getActivityIcon(selectedLog.type)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Activity Details
                      </h2>
                      <p className="text-sm text-gray-500">
                        {getActivityLabel(selectedLog.type)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    <RiCloseLine className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Summary</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getActivitySummary(selectedLog)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedLog.timestamp)}
                  </p>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">
                    Admin
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getAdminDisplay(selectedLog).name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    {getAdminDisplay(selectedLog).email}
                  </p>
                </div>

                {selectedLog.details &&
                  Object.keys(selectedLog.details).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Details</p>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-xl overflow-x-auto">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
