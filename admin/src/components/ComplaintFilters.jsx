// src/components/ComplaintFilters.jsx
import React, { useState, useEffect, useRef } from "react";
import { RiSearchLine, RiFilterLine, RiRefreshLine } from "react-icons/ri";

const ComplaintFilters = ({ onFilterChange, initialFilters }) => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [priority, setPriority] = useState(""); // new
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isInitialized = useRef(false);
  const isApplyingInitialFilters = useRef(false);

  // Initialize from parent filters
  useEffect(() => {
    if (initialFilters && !isApplyingInitialFilters.current) {
      console.log("🎯 ComplaintFilters received initialFilters:", initialFilters);
      isApplyingInitialFilters.current = true;

      if (initialFilters.status !== undefined) {
        setStatus(initialFilters.status || "");
      }
      if (initialFilters.search !== undefined) {
        setSearch(initialFilters.search || "");
        setDebouncedSearch(initialFilters.search || "");
      }
      if (initialFilters.dateRange !== undefined) {
        setDateRange(initialFilters.dateRange || "all");
      }
      if (initialFilters.priority !== undefined) {
        setPriority(initialFilters.priority || "");
      }

      setTimeout(() => {
        isInitialized.current = true;
        isApplyingInitialFilters.current = false;
      }, 0);
    }
  }, [initialFilters]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Auto apply filters when changed
  useEffect(() => {
    if (isInitialized.current && !isApplyingInitialFilters.current) {
      handleApplyFilters();
    }
  }, [status, debouncedSearch, dateRange, priority]);

  const handleApplyFilters = () => {
    const filters = {
      status,
      search: debouncedSearch,
      dateRange,
      priority,
    };
    console.log("🔍 ComplaintFilters applying:", filters);
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStatus("");
    setSearch("");
    setDateRange("all");
    setPriority("");
    setDebouncedSearch("");
    onFilterChange({ status: "", search: "", dateRange: "all", priority: "" });
  };

  const hasActiveFilters =
    status !== "" ||
    debouncedSearch !== "" ||
    dateRange !== "all" ||
    priority !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            id="search-filter"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, description, category, location..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {search.length > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Searching... ({search.length} characters)
            </p>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <RiFilterLine className="hidden md:block text-gray-500 dark:text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Date range */}
        <div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RiRefreshLine className="h-4 w-4" />
          <span>{hasActiveFilters ? "Clear filters" : "Reset"}</span>
        </button>
      </div>
    </div>
  );
};

export default ComplaintFilters;
