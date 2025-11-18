// src/components/common/Loading.jsx
import React from 'react' 
function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        
        {/* Banner Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
        </div>
        
        {/* Submit Button Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48"></div>
        
        {/* Recent Complaints Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
      </div>
    </div>
  );
}

export default Loading;