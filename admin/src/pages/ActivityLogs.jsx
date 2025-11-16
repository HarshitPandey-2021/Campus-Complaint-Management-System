// src/pages/ActivityLogs.jsx - REPLACE ENTIRE FILE

import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import {
  getAllLogs,
  exportLogsToCSV,
  clearAllLogs,
  getLogStatistics,
  ACTIVITY_TYPES
} from '../services/activityLogger';
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
  RiUserLine
} from 'react-icons/ri';

const ActivityLogs = () => {
  const { success } = useToast();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });

  // Quick filter buttons
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');

  // Load logs
  const loadLogs = () => {
    setLoading(true);
    setTimeout(() => {
      const allLogs = getAllLogs();
      setLogs(allLogs);
      applyFilters(allLogs, filters, activeQuickFilter);
      setStats(getLogStatistics());
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Apply all filters
  const applyFilters = (logsToFilter, currentFilters, quickFilter) => {
    let filtered = [...logsToFilter];

    // Apply quick filter
    if (quickFilter !== 'all') {
      filtered = filtered.filter(log => log.type === quickFilter);
    }

    // Apply search filter
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.admin.name.toLowerCase().includes(searchLower) ||
        log.admin.email.toLowerCase().includes(searchLower) ||
        log.type.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.details).toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (currentFilters.startDate) {
      const startDate = new Date(currentFilters.startDate);
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (currentFilters.endDate) {
      const endDate = new Date(currentFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    setFilteredLogs(filtered);
  };

  // Update filters
  useEffect(() => {
    applyFilters(logs, filters, activeQuickFilter);
  }, [filters, activeQuickFilter, logs]);

  const handleQuickFilter = (filterType) => {
    setActiveQuickFilter(filterType);
  };

  const handleResetFilters = () => {
    setFilters({ search: '', startDate: '', endDate: '' });
    setActiveQuickFilter('all');
  };

  const handleExport = () => {
    exportLogsToCSV(filteredLogs);
    success(`📥 Exported ${filteredLogs.length} logs to CSV`);
  };

  const handleClearAll = () => {
    if (clearAllLogs()) {
      loadLogs();
      success('🗑️ All activity logs cleared');
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
        return <RiDownloadLine className="h-5 w-5" />;
      default:
        return <RiAlertLine className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.LOGIN:
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case ACTIVITY_TYPES.LOGOUT:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case ACTIVITY_TYPES.COMPLAINT_EXPORT:
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <p className="text-gray-500 dark:text-gray-400 italic">No additional details</p>;
    }

    return Object.entries(details).map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      
      return (
        <div key={key} className="mb-2">
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">
              {formattedKey}:
            </span>
            <span className="text-gray-600 dark:text-gray-400 break-all">
              {formattedValue}
            </span>
          </div>
        </div>
      );
    });
  };

  const getActivitySummary = (log) => {
    const details = log.details || {};
    
    switch (log.type) {
      case ACTIVITY_TYPES.STATUS_CHANGE:
        return `Changed complaint #${details.complaintId} from ${details.previousStatus} to ${details.newStatus}`;
      case ACTIVITY_TYPES.COMPLAINT_VIEW:
        return `Viewed ${details.page || 'page'}`;
      case ACTIVITY_TYPES.COMPLAINT_EXPORT:
        return `${details.action || 'Exported data'} (${details.complaintCount || 0} items)`;
      case ACTIVITY_TYPES.LOGIN:
        return details.action || 'Logged in';
      default:
        return details.action || 'Performed action';
    }
  };

  const openModal = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const hasActiveFilters = filters.search || filters.startDate || filters.endDate || activeQuickFilter !== 'all';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <RiHistoryLine className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Activity Logs
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Complete audit trail of all admin activities and system events
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Logs</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Today</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {stats.today}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">This Week</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {stats.thisWeek}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">This Month</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
              {stats.thisMonth}
            </p>
          </div>
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Filters</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeQuickFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleQuickFilter(ACTIVITY_TYPES.STATUS_CHANGE)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeQuickFilter === ACTIVITY_TYPES.STATUS_CHANGE
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => handleQuickFilter(ACTIVITY_TYPES.COMPLAINT_VIEW)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeQuickFilter === ACTIVITY_TYPES.COMPLAINT_VIEW
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Views
          </button>
          <button
            onClick={() => handleQuickFilter(ACTIVITY_TYPES.COMPLAINT_EXPORT)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeQuickFilter === ACTIVITY_TYPES.COMPLAINT_EXPORT
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Exports
          </button>
          <button
            onClick={() => handleQuickFilter(ACTIVITY_TYPES.LOGIN)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeQuickFilter === ACTIVITY_TYPES.LOGIN
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Login
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Search & Date Range</p>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
            />
          </div>

          {/* End Date */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              <RiFilterOffLine className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Clear Filters</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <RiDownloadLine className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Export ({filteredLogs.length})</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <RiDeleteBinLine className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
            {filteredLogs.length === logs.length ? (
              `All ${logs.length} logs`
            ) : (
              `${filteredLogs.length} of ${logs.length} logs`
            )}
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <RiHistoryLine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
              {hasActiveFilters ? 'No logs match your filters' : 'No logs yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {/* Log Item */}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(log.type)}`}>
                    {getActivityIcon(log.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                      {getActivitySummary(log)}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {log.admin.name} • {formatDate(log.timestamp)}
                    </p>
                  </div>

                  {/* Eye Icon - Fixed Size */}
                  <button
                    onClick={() => openModal(log)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors flex-shrink-0"
                    title="View Details"
                  >
                    <RiEyeLine className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Full Details */}
      {showModal && selectedLog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Activity Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <RiCloseLine className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Activity Type */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                <div className={`inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-lg ${getActivityColor(selectedLog.type)}`}>
                  {getActivityIcon(selectedLog.type)}
                  <span className="font-medium text-sm">{selectedLog.type.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Time</label>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-all">{formatDate(selectedLog.timestamp)}</p>
              </div>

              {/* Admin Info */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Performed By</label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium break-all">{selectedLog.admin.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{selectedLog.admin.email}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{selectedLog.admin.role}</p>
                </div>
              </div>

              {/* Action Summary */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Summary</label>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-words">{getActivitySummary(selectedLog)}</p>
              </div>

              {/* Details */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Details</label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs sm:text-sm">
                  {formatDetails(selectedLog.details)}
                </div>
              </div>

              {/* Device Info */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Device</label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                  <p className="text-gray-600 dark:text-gray-400 mb-1 break-all">
                    <span className="font-medium">Platform:</span> {selectedLog.device.platform}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-1 break-all">
                    <span className="font-medium">Browser:</span> {selectedLog.device.userAgent}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 break-all">
                    <span className="font-medium">Screen:</span> {selectedLog.device.screenSize}
                  </p>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">URL</label>
                <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 mt-1 font-mono break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {selectedLog.url}
                </p>
              </div>

              {/* Session ID */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Session ID</label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {selectedLog.sessionId}
                </p>
              </div>
            </div>

            {/* Modal Footer - Sticky */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;