// src/pages/Analytics.jsx - RESPONSIVE & AUTO-REFRESH
import React, { useState, useEffect, useCallback } from "react";
import Charts from "../components/Charts";
import Loading from "../components/Loading";
import { getStats } from "../api";
import { getAdminToken } from "../utils/tokenUtils";
import {
  RiBarChartFill,
  RiPieChartFill,
  RiLineChartFill,
  RiRefreshLine,
} from "react-icons/ri";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0,
  });
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const token = getAdminToken() || localStorage.getItem("token");

  // Fetch analytics data from backend
  const fetchAnalyticsData = useCallback(async (isManualRefresh = false) => {
    try {
      console.log("📊 Fetching analytics with token:", !!token);
      
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) {
        console.error("❌ No token found");
        return;
      }

      // ✅ Single API call to get all stats
      const statsData = await getStats(token);
      console.log("✅ FULL Analytics Data:", statsData);

      // ✅ Extract basic stats
      setStats({
        total: statsData.stats?.total || statsData.total || 0,
        resolved: statsData.stats?.resolved || statsData.resolved || 0,
        pending: statsData.stats?.pending || statsData.pending || 0,
        inProgress: statsData.stats?.inProgress || statsData.inProgress || 0,
        rejected: statsData.stats?.rejected || statsData.rejected || 0,
      });

      // ✅ Extract average resolution time
      setAvgResolutionTime(statsData.avgResolutionTime || 0);

      // ✅ Extract and format category data (multiple possible structures)
      const categories = [];
      
      // Structure 1: statsData.categories array
      if (statsData.categories && Array.isArray(statsData.categories)) {
        console.log("✅ Found categories array:", statsData.categories);
        statsData.categories.forEach((cat) => {
          categories.push({
            name: cat._id || cat.name || cat.category || "Unknown",
            Complaints: cat.count || cat.total || 0,
          });
        });
      }
      // Structure 2: statsData.byCategory object
      else if (statsData.byCategory && typeof statsData.byCategory === 'object') {
        console.log("✅ Found byCategory object:", statsData.byCategory);
        Object.entries(statsData.byCategory).forEach(([name, count]) => {
          categories.push({ name, Complaints: count });
        });
      }
      // Structure 3: statsData.categoryStats array
      else if (statsData.categoryStats && Array.isArray(statsData.categoryStats)) {
        console.log("✅ Found categoryStats:", statsData.categoryStats);
        statsData.categoryStats.forEach((cat) => {
          categories.push({
            name: cat._id || cat.name || "Unknown",
            Complaints: cat.count || 0,
          });
        });
      }
      // Fallback: Default categories if no data
      else {
        console.log("⚠️ No category data found - using fallback");
        categories.push(
          { name: "Academic", Complaints: 0 },
          { name: "Infrastructure", Complaints: 0 },
          { name: "Hostel", Complaints: 0 }
        );
      }

      // Sort by count and limit to top 10
      const sortedCategories = categories
        .sort((a, b) => b.Complaints - a.Complaints)
        .slice(0, 10);

      setCategoryData(sortedCategories);
      console.log("✅ Final categoryData:", sortedCategories);

      // ✅ Extract and format priority data
      const priorities = [];
      
      if (statsData.byPriority && typeof statsData.byPriority === 'object') {
        console.log("✅ Found byPriority:", statsData.byPriority);
        Object.entries(statsData.byPriority).forEach(([name, value]) => {
          if (name !== "UNKNOWN" || value > 0) { // Skip unknown if zero
            priorities.push({ name, value: value || 0 });
          }
        });
      } else if (statsData.priorities && Array.isArray(statsData.priorities)) {
        console.log("✅ Found priorities array:", statsData.priorities);
        statsData.priorities.forEach((pri) => {
          priorities.push({
            name: pri._id || pri.priority || "Unknown",
            value: pri.count || 0,
          });
        });
      } else {
        // Fallback priorities
        priorities.push(
          { name: "High", value: 0 },
          { name: "Medium", value: 0 },
          { name: "Low", value: 0 }
        );
      }

      setPriorityData(priorities.slice(0, 8));
      console.log("✅ Final priorityData:", priorities);

      // Update last refresh timestamp
      setLastUpdated(new Date());

    } catch (error) {
      console.error("❌ Error fetching analytics data:", error);
      
      // ✅ Fallback data on error (prevents blank screen)
      setCategoryData([
        { name: "No Data", Complaints: 0 },
      ]);
      setPriorityData([
        { name: "No Data", value: 0 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (token) {
      fetchAnalyticsData(false);
    }
  }, [token, fetchAnalyticsData]);

  // ✅ Auto-refresh every 60 seconds
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing analytics...");
      fetchAnalyticsData(false);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [token, fetchAnalyticsData]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchAnalyticsData(true);
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const now = new Date();
    const diffMs = now - lastUpdated;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // Show loading skeleton on initial load
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        <Loading type="chart" />
        <div className="mt-6"><Loading type="chart" /></div>
        <div className="mt-6"><Loading type="chart" /></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-enter min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Refresh Button */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
            Analytics & Insights
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive data visualization of complaints and statistics.
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {formatLastUpdated()}
            </p>
          )}
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RiRefreshLine className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">In Progress</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Resolved</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.resolved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Rejected</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Charts Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Status Distribution - Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <RiPieChartFill className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
            Status Distribution
          </h3>
          {stats.total > 0 ? (
            <Charts
              type="pie"
              data={[
                { name: "Pending", value: stats.pending },
                { name: "In Progress", value: stats.inProgress },
                { name: "Resolved", value: stats.resolved },
                { name: "Rejected", value: stats.rejected },
              ].filter(item => item.value > 0)} // Only show non-zero
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Category Distribution - Bar Chart (RESPONSIVE) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <RiBarChartFill className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            By Category
          </h3>
          {categoryData.length > 0 && categoryData.some(c => c.Complaints > 0) ? (
            <Charts 
              type="bar" 
              data={categoryData.filter(c => c.Complaints > 0)} // Only non-zero
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Priority Distribution - Full Width (RESPONSIVE) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <RiLineChartFill className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
          Priority Distribution
        </h3>
        {priorityData.length > 0 && priorityData.some(p => p.value > 0) ? (
          <Charts 
            type="bar" 
            data={priorityData.filter(p => p.value > 0)} // Only non-zero
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No priority data available</p>
          </div>
        )}
      </div>

      {/* Average Resolution Time - Responsive Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-900/30 hover:shadow-lg transition-shadow">
        <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium">
          Average Resolution Time
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-200 mt-2">
          {avgResolutionTime > 0 
            ? (avgResolutionTime > 24 
                ? `${(avgResolutionTime/24).toFixed(1)} days` 
                : `${avgResolutionTime.toFixed(1)} hrs`)
            : "N/A"}
        </p>
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          Time taken to resolve complaints on average
        </p>
      </div>
    </div>
  );
};

export default Analytics;

