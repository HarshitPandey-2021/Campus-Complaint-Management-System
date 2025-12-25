// src/pages/Analytics.jsx
import React, { useState, useEffect } from "react";
import Charts from "../components/Charts";
import Loading from "../components/Loading";
import {
  getComplaintsByCategory,
  getComplaintsByStatus,
  getComplaintsTrend,
  getPriorityDistribution,
  getAverageResolutionTime,
  getStats,
} from "../api";
import { getAdminToken } from "../utils/tokenUtils";
import {
  RiBarChartFill,
  RiPieChartFill,
  RiLineChartFill,
  RiTimeLine,
} from "react-icons/ri";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0,
  });
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);

  const token = getAdminToken() || localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const [
          categoryRes,
          statusRes,
          trendRes,
          priorityRes,
          avgTimeRes,
          statsRes,
        ] = await Promise.all([
          getComplaintsByCategory(token),
          getComplaintsByStatus(token),
          getComplaintsTrend(token),
          getPriorityDistribution(token),
          getAverageResolutionTime(token),
          getStats(token),
        ]);

        // Category Data
        if (categoryRes && typeof categoryRes === "object") {
          setCategoryData(
            Object.entries(categoryRes).map(([name, value]) => ({
              name,
              Complaints: value,
            }))
          );
        }

        // Status Data
        if (statusRes && typeof statusRes === "object") {
          setStatusData(
            Object.entries(statusRes).map(([name, value]) => ({
              name,
              value,
            }))
          );
        }

        // Trend Data
        if (trendRes && typeof trendRes === "object") {
          setTrendData(
            Object.entries(trendRes).map(([name, value]) => ({
              name,
              value,
            }))
          );
        }

        // Priority Data
        if (priorityRes && typeof priorityRes === "object") {
          setPriorityData(
            Object.entries(priorityRes).map(([name, value]) => ({
              name,
              value,
            }))
          );
        }

        // Avg Resolution Time
        setAvgResolutionTime(avgTimeRes || 0);

        // Stats
        if (statsRes && typeof statsRes === "object") {
          setStats({
            total: statsRes.total || 0,
            resolved: statsRes.resolved || 0,
            pending: statsRes.pending || 0,
            inProgress: statsRes.inProgress || 0,
            rejected: statsRes.rejected || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalyticsData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        <Loading type="chart" />
        <div className="mt-6">
          <Loading type="chart" />
        </div>
        <div className="mt-6">
          <Loading type="chart" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-enter min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Analytics & Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive data visualization of complaints and statistics.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Total
          </p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">
            {stats.total}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Pending
          </p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {stats.pending}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            In Progress
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {stats.inProgress}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Resolved
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {stats.resolved}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Rejected
          </p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <RiPieChartFill className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Status Distribution
          </h3>
          {statusData.length > 0 ? (
            <Charts type="pie" data={statusData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <RiBarChartFill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            By Category
          </h3>
          {categoryData.length > 0 ? (
            <Charts type="bar" data={categoryData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <RiLineChartFill className="h-5 w-5 text-green-600 dark:text-green-400" />
          Priority Distribution
        </h3>
        {priorityData.length > 0 ? (
          <Charts type="bar" data={priorityData} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No data available</p>
          </div>
        )}
      </div>

      {/* Avg Resolution Time */}
      <div className="mt-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-6 border border-purple-200 dark:border-purple-900/30">
        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
          Average Resolution Time
        </p>
        <p className="text-3xl font-bold text-purple-900 dark:text-purple-200 mt-2">
          {avgResolutionTime > 0 ? `${avgResolutionTime.toFixed(1)} hrs` : "N/A"}
        </p>
      </div>
    </div>
  );
};
export default Analytics;
