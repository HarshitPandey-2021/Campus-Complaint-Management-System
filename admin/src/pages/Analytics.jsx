// src/pages/Analytics.jsx

import React, { useState, useEffect } from 'react';
// ❌ REMOVED: import { ToastContainer } from '../components/Toast';
// ❌ REMOVED: import { useToast } from '../hooks/useToast'; (not used in this component)
import Charts from '../components/Charts';
import Loading from '../components/Loading';
import { 
  getComplaintsByCategory, 
  getComplaintsByStatus, 
  getComplaintsTrend,
  getPriorityDistribution,
  getAverageResolutionTime,
  getStats 
} from '../services/adminService';
import { RiBarChartFill, RiPieChartFill, RiLineChartFill, RiTimeLine } from 'react-icons/ri';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [stats, setStats] = useState(null);
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);
  
  // ❌ REMOVED: const { toasts, removeToast } = useToast();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCategoryData(getComplaintsByCategory());
      setStatusData(getComplaintsByStatus());
      setTrendData(getComplaintsTrend());
      setPriorityData(getPriorityDistribution());
      setStats(getStats());
      setAvgResolutionTime(getAverageResolutionTime());
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Loading type="chart" />
        <Loading type="chart" />
        <Loading type="chart" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ❌ REMOVED: <ToastContainer toasts={toasts} removeToast={removeToast} /> */}
      {/* ✅ Toast now renders globally from ToastProvider in App.jsx */}

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Analytics & Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive insights and visualizations of complaint data.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Complaints */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <RiBarChartFill className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Resolution Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <RiPieChartFill className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Pending Complaints */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <RiLineChartFill className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Resolution</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{avgResolutionTime}h</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <RiTimeLine className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <Charts 
        categoryData={categoryData}
        statusData={statusData}
        trendData={trendData}
      />

      {/* Priority Distribution */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
          Priority Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {priorityData.map((priority) => (
            <div 
              key={priority.name}
              className={`p-4 rounded-lg border ${
                priority.name === 'High' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : priority.name === 'Medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    priority.name === 'High'
                      ? 'text-red-600 dark:text-red-400'
                      : priority.name === 'Medium'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {priority.name} Priority
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {priority.value}
                  </p>
                </div>
                <div className={`text-3xl ${
                  priority.name === 'High'
                    ? 'text-red-600 dark:text-red-400'
                    : priority.name === 'Medium'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {priority.name === 'High' ? '🔴' : priority.name === 'Medium' ? '🟡' : '🟢'}
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      priority.name === 'High'
                        ? 'bg-red-600 dark:bg-red-500'
                        : priority.name === 'Medium'
                        ? 'bg-yellow-600 dark:bg-yellow-500'
                        : 'bg-green-600 dark:bg-green-500'
                    }`}
                    style={{ width: `${(priority.value / stats.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {((priority.value / stats.total) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
          📊 Quick Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{stats.total}</span> total complaints received
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold">•</span>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{stats.resolved}</span> successfully resolved
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{stats.pending}</span> awaiting review
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 dark:text-yellow-400 font-bold">•</span>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{stats.inProgress}</span> currently in progress
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
            <p className="text-gray-700 dark:text-gray-300">
              Average resolution time: <span className="font-semibold">{avgResolutionTime} hours</span>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-600 dark:text-red-400 font-bold">•</span>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{stats.rejected}</span> complaints rejected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;