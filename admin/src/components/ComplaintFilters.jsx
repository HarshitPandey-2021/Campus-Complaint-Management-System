// src/components/ComplaintFilters.jsx

import React, { useState, useEffect } from 'react';
import { RiSearchLine, RiFilterLine, RiRefreshLine } from 'react-icons/ri';

const ComplaintFilters = ({ onFilterChange }) => {
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    handleApplyFilters();
  }, [debouncedSearch]);

  const handleApplyFilters = () => {
    onFilterChange({
      status,
      search: debouncedSearch,
      dateRange
    });
  };

  const handleReset = () => {
    setStatus('All');
    setSearch('');
    setDateRange('All');
    setDebouncedSearch('');
    onFilterChange({
      status: 'All',
      search: '',
      dateRange: 'All'
    });
  };

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
            <option value="All">All Status</option>
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
            <option value="All">All Time</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex flex-col sm:flex-row md:flex-col gap-2 md:justify-end">
          <label className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actions
          </label>
          <button
            onClick={handleApplyFilters}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-sm"
          >
            <RiFilterLine className="h-5 w-5" />
            <span>Apply</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all"
          >
            <RiRefreshLine className="h-5 w-5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {(status !== 'All' || debouncedSearch !== '' || dateRange !== 'All') && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>
            {status !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                Status: {status}
                <button
                  onClick={() => setStatus('All')}
                  className="ml-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                  aria-label="Remove status filter"
                >
                  ✕
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                Search: "{debouncedSearch}"
                <button
                  onClick={() => setSearch('')}
                  className="ml-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                  aria-label="Remove search filter"
                >
                  ✕
                </button>
              </span>
            )}
            {dateRange !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                Date: {dateRange}
                <button
                  onClick={() => setDateRange('All')}
                  className="ml-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                  aria-label="Remove date filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters;