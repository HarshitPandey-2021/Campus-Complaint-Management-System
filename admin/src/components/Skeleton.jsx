// src/components/Skeleton.jsx (Admin Portal)
import React from 'react';

export default function Skeleton({ variant = 'text', width = 'w-full', height = 'h-4', className = '' }) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-800 rounded';
  
  const variants = {
    text: `${height} ${width}`,
    circle: 'rounded-full',
    rectangle: 'rounded-xl',
    card: 'h-48 w-full rounded-xl'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}></div>
  );
}

// Dashboard Skeleton - Matches actual Dashboard layout
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64 sm:w-80 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 sm:w-72"></div>
            </div>
            <div className="h-11 w-44 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-800 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-20 sm:w-28 mb-3"></div>
                  <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-14 sm:w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 hidden sm:block"></div>
                </div>
                <div className="h-11 w-11 sm:h-14 sm:w-14 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Complaints Section Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8 animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div>
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-36 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-52 hidden sm:block"></div>
              </div>
            </div>
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>

          {/* Table Header Skeleton - Desktop */}
          <div className="hidden md:block">
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>

          {/* Table Rows / Mobile Cards Skeleton */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 sm:px-6">
                {/* Desktop Row */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 flex-1"></div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </div>
                {/* Mobile Card */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-48"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Footer Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-5 sm:p-6 h-36 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-20 sm:w-28 mb-3"></div>
          <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-14 sm:w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 hidden sm:block"></div>
        </div>
        <div className="h-11 w-11 sm:h-14 sm:w-14 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8"></div></td>
      <td className="px-4 py-4"><div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
      <td className="px-4 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-40 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
      </td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
      <td className="px-4 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-20"></div></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div></td>
      <td className="px-4 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div></td>
      <td className="px-4 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-16"></div></td>
      <td className="px-4 py-4"><div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
    </tr>
  );
}

// Complaints Table Skeleton
export function ComplaintsTableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-32"></div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              {[...Array(9)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              </div>
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-2"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-32"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-full mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-4"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 mb-6"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-40"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-64"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="flex flex-col items-center mb-6">
                <div className="w-28 h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-24 mb-3"></div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mt-6"></div>
            </div>
          </div>

          {/* Right Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-40"></div>
                </div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-2"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-40"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}