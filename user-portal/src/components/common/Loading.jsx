// src/components/common/Loading.jsx (User Portal)
import React from 'react';

function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64 sm:w-80 mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 sm:w-72"></div>
        </div>

        {/* Stats Cards Skeleton - Matches actual layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-800 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-20 sm:w-24 mb-3"></div>
                  <div className="h-7 sm:h-9 bg-gray-200 dark:bg-gray-800 rounded-xl w-12 sm:w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 hidden sm:block"></div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 animate-pulse"
            >
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="ml-4 flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-36 sm:w-44 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-24 sm:w-32"></div>
                </div>
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Complaints Section Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
          {/* Section Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div>
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-36 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 hidden sm:block"></div>
              </div>
            </div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>

          {/* Complaint Items Skeleton */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 sm:px-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 sm:w-64"></div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-24"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;