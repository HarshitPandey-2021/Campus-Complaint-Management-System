// src/components/Loading.jsx (Admin Portal)
import React from 'react';
import { DashboardSkeleton, ComplaintsTableSkeleton, ChartSkeleton, ProfileSkeleton } from './Skeleton';

const Loading = ({ type = 'dashboard' }) => {
  switch (type) {
    case 'dashboard':
    case 'chart':
      return <DashboardSkeleton />;
    case 'table':
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-72"></div>
            </div>
            
            {/* Filters */}
            <div className="mb-4 animate-pulse">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
            
            <ComplaintsTableSkeleton />
          </div>
        </div>
      );
    case 'profile':
      return <ProfileSkeleton />;
    case 'analytics':
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-64"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        </div>
      );
    default:
      return <DashboardSkeleton />;
  }
};

export default Loading;