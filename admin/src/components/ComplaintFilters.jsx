// src/components/ComplaintFilters.jsx

import React, { useState, useEffect, useRef } from 'react';
import { RiSearchLine, RiFilterLine, RiRefreshLine } from 'react-icons/ri';

const ComplaintFilters = ({ onFilterChange, initialFilters }) => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // ✅ NEW: Track if component has been initialized
  const isInitialized = useRef(false);
  const isApplyingInitialFilters = useRef(false);

  // ✅ FIXED: Apply initial filters from Dashboard navigation FIRST
  useEffect(() => {
    if (initialFilters && !isApplyingInitialFilters.current) {
      console.log('🎯 ComplaintFilters received initialFilters:', initialFilters);
      
      isApplyingInitialFilters.current = true;
      
      // Set all filters at once
      if (initialFilters.status !== undefined) {
        setStatus(initialFilters.status || '');
      }
      if (initialFilters.search !== undefined) {
        setSearch(initialFilters.search || '');
        setDebouncedSearch(initialFilters.search || '');
      }
      if (initialFilters.dateRange !== undefined) {
        setDateRange(initialFilters.dateRange || 'all');
      }

      // Mark as initialized after applying initial filters
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

  // ✅ FIXED: Auto-apply filters ONLY after initialization
  useEffect(() => {
    // Don't apply filters on initial mount or when applying initial filters
    if (isInitialized.current && !isApplyingInitialFilters.current) {
      handleApplyFilters();
    }
  }, [status, debouncedSearch, dateRange]);

  const handleApplyFilters = () => {
    const filters = {
      status,
      search: debouncedSearch,
      dateRange
    };
    
    console.log('🔍 ComplaintFilters applying:', filters);
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStatus('');
    setSearch('');
    setDateRange('all');
    setDebouncedSearch('');
    
    onFilterChange({
      status: '',
      search: '',
      dateRange: 'all'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = status !== '' || debouncedSearch !== '' || dateRange !== 'all';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      {/* Header - Mobile Only */}
      <div className="flex items-center gap-2 mb-4 md:hidden">
        <RiFilterLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Filter Complaints</h2>
      </div>

      {/* Filters Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Status Filter */}
        <div className="md:col-span-3">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="md:col-span-5">
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <RiSearchLine className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              id="search-filter"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, category, or location..."
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {search && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Searching... ({search.length} characters)
            </p>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="md:col-span-2">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            id="date-filter"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex flex-col sm:flex-row md:flex-col gap-2 md:justify-end">
          <label className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actions
          </label>
          <button
            onClick={handleApplyFilters}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all hover:scale-105 shadow-sm"
          >
            <RiFilterLine className="h-5 w-5" />
            <span>Apply</span>
          </button>
          <button
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiRefreshLine className="h-5 w-5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>
            
            {status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                Status: {status}
                <button
                  onClick={() => setStatus('')}
                  className="ml-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors"
                  aria-label="Remove status filter"
                >
                  ✕
                </button>
              </span>
            )}
            
            {debouncedSearch && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                Search: "{debouncedSearch.length > 20 ? debouncedSearch.substring(0, 20) + '...' : debouncedSearch}"
                <button
                  onClick={() => setSearch('')}
                  className="ml-2 text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-200 transition-colors"
                  aria-label="Remove search filter"
                >
                  ✕
                </button>
              </span>
            )}
            
            {dateRange !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                Date: {dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                <button
                  onClick={() => setDateRange('all')}
                  className="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                  aria-label="Remove date filter"
                >
                  ✕
                </button>
              </span>
            )}
            
            <button
              onClick={handleReset}
              className="ml-auto text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters;