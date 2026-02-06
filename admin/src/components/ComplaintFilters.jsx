// src/components/ComplaintFilters.jsx - FIXED: Compact responsive layout
import React, { useState, useEffect, useRef } from "react";
import { RiSearchLine, RiFilterLine, RiRefreshLine, RiArrowDownSLine } from "react-icons/ri";

const ComplaintFilters = ({ onFilterChange, initialFilters }) => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [priority, setPriority] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const isInitialized = useRef(false);
  const isApplyingInitialFilters = useRef(false);

  useEffect(() => {
    if (initialFilters && !isApplyingInitialFilters.current) {
      isApplyingInitialFilters.current = true;

      if (initialFilters.status !== undefined) setStatus(initialFilters.status || "");
      if (initialFilters.search !== undefined) {
        setSearch(initialFilters.search || "");
        setDebouncedSearch(initialFilters.search || "");
      }
      if (initialFilters.dateRange !== undefined) setDateRange(initialFilters.dateRange || "all");
      if (initialFilters.priority !== undefined) setPriority(initialFilters.priority || "");

      setTimeout(() => {
        isInitialized.current = true;
        isApplyingInitialFilters.current = false;
      }, 0);
    }
  }, [initialFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isInitialized.current && !isApplyingInitialFilters.current) {
      onFilterChange({ status, search: debouncedSearch, dateRange, priority });
    }
  }, [status, debouncedSearch, dateRange, priority, onFilterChange]);

  const handleReset = () => {
    setStatus("");
    setSearch("");
    setDateRange("all");
    setPriority("");
    setDebouncedSearch("");
    onFilterChange({ status: "", search: "", dateRange: "all", priority: "" });
  };

  const hasActiveFilters = status !== "" || debouncedSearch !== "" || dateRange !== "all" || priority !== "";
  const activeFilterCount = [status, debouncedSearch, dateRange !== "all" ? dateRange : "", priority].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Search Bar - Always visible */}
      <div className="p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Toggle Button - Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RiFilterLine className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center h-5 w-5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
            <RiArrowDownSLine className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Desktop Filters - Inline */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RiRefreshLine className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters - Expandable */}
      {showFilters && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 p-3 space-y-3 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <RiRefreshLine className="h-4 w-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters;