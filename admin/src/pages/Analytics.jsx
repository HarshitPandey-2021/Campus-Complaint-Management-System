// src/pages/Analytics.jsx - FIXED: Vertical bars, only actual data, enhanced
import React, { useState, useEffect, useCallback } from "react";
import Loading from "../components/Loading";
import { getStats } from "../api";
import { getAdminToken } from "../utils/tokenUtils";
import {
  RiBarChartFill,
  RiPieChartFill,
  RiRefreshLine,
  RiTimeLine,
  RiPercentLine,
  RiTrophyLine,
  RiFlashlightLine,
} from "react-icons/ri";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Resolved: "#10b981",
  Rejected: "#ef4444",
};

const CATEGORY_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];

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

  const fetchAnalyticsData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) return;

      const statsData = await getStats(token);

      setStats({
        total: statsData.stats?.total || statsData.total || 0,
        resolved: statsData.stats?.resolved || statsData.resolved || 0,
        pending: statsData.stats?.pending || statsData.pending || 0,
        inProgress: statsData.stats?.inProgress || statsData.inProgress || 0,
        rejected: statsData.stats?.rejected || statsData.rejected || 0,
      });

      setAvgResolutionTime(statsData.avgResolutionTime || 0);

      // Process category data - only include non-zero values
      const categories = [];
      if (statsData.categories && Array.isArray(statsData.categories)) {
        statsData.categories.forEach((cat) => {
          const count = cat.count || cat.total || 0;
          if (count > 0) {
            categories.push({
              name: cat._id || cat.name || cat.category || "Other",
              count: count,
            });
          }
        });
      } else if (statsData.byCategory && typeof statsData.byCategory === "object") {
        Object.entries(statsData.byCategory).forEach(([name, count]) => {
          if (count > 0) {
            categories.push({ name, count });
          }
        });
      }
      setCategoryData(categories.sort((a, b) => b.count - a.count).slice(0, 8));

      // Process priority data - only include non-zero values
      const priorities = [];
      if (statsData.byPriority && typeof statsData.byPriority === "object") {
        Object.entries(statsData.byPriority).forEach(([name, value]) => {
          if (value > 0 && name !== "UNKNOWN") {
            priorities.push({ name, value });
          }
        });
      } else if (statsData.priorities && Array.isArray(statsData.priorities)) {
        statsData.priorities.forEach((pri) => {
          const value = pri.count || 0;
          if (value > 0) {
            priorities.push({
              name: pri._id || pri.priority || "Unknown",
              value,
            });
          }
        });
      }
      setPriorityData(priorities);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchAnalyticsData(false);
  }, [token, fetchAnalyticsData]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchAnalyticsData(false), 60000);
    return () => clearInterval(interval);
  }, [token, fetchAnalyticsData]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const diffSecs = Math.floor((new Date() - lastUpdated) / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    return `${Math.floor(diffSecs / 60)}m ago`;
  };

  // Prepare pie chart data - only non-zero values
  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "In Progress", value: stats.inProgress },
    { name: "Resolved", value: stats.resolved },
    { name: "Rejected", value: stats.rejected },
  ].filter((item) => item.value > 0);

  // Calculate rates
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const activeRate = stats.total > 0 ? Math.round(((stats.pending + stats.inProgress) / stats.total) * 100) : 0;
  const rejectionRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Loading type="chart" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
              Analytics & Insights
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Last updated: {formatLastUpdated()}
            </p>
          </div>
          <button
            onClick={() => fetchAnalyticsData(true)}
            disabled={refreshing}
            className="self-start sm:self-auto flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            <RiRefreshLine className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-gray-800 dark:text-gray-200", bg: "bg-white dark:bg-gray-800" },
            { label: "Pending", value: stats.pending, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "In Progress", value: stats.inProgress, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Resolved", value: stats.resolved, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.bg} rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700`}
            >
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Rate Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <RiTrophyLine className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                <p className="text-xs sm:text-sm font-medium text-white/80">Resolution Rate</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{resolutionRate}%</p>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                {stats.resolved} of {stats.total} resolved
              </p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <RiTrophyLine className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <RiFlashlightLine className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                <p className="text-xs sm:text-sm font-medium text-white/80">Active Rate</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{activeRate}%</p>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                {stats.pending + stats.inProgress} active complaints
              </p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <RiFlashlightLine className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <RiTimeLine className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                <p className="text-xs sm:text-sm font-medium text-white/80">Avg. Resolution</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {avgResolutionTime > 0
                  ? avgResolutionTime > 24
                    ? `${(avgResolutionTime / 24).toFixed(1)}d`
                    : `${avgResolutionTime.toFixed(1)}h`
                  : "N/A"}
              </p>
              <p className="text-xs sm:text-sm text-white/70 mt-1">Average time to resolve</p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <RiTimeLine className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Pie Chart - Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <RiPieChartFill className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              Status Distribution
            </h3>
            <div className="h-[250px] sm:h-[300px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[entry.name] || "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} complaints`, name]}
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs sm:text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart - Category Distribution (VERTICAL) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <RiBarChartFill className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Complaints by Category
            </h3>
            <div className="h-[250px] sm:h-[300px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tickFormatter={(value) => (value.length > 8 ? `${value.slice(0, 8)}...` : value)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} complaints`, "Count"]}
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Priority Distribution (VERTICAL) */}
        {priorityData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <RiPercentLine className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Priority Distribution
            </h3>
            <div className="h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value} complaints`, "Count"]}
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => {
                      const priorityColors = {
                        High: "#ef4444",
                        Medium: "#f59e0b",
                        Low: "#10b981",
                      };
                      return <Cell key={index} fill={priorityColors[entry.name] || "#6366f1"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-indigo-200 dark:border-indigo-900/30">
          <h3 className="text-sm sm:text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">
            Quick Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Complaints</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{stats.total}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Resolution Rate</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{resolutionRate}%</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Pending Action</p>
              <p className="font-bold text-amber-600 dark:text-amber-400 text-lg">{stats.pending + stats.inProgress}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Categories</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{categoryData.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;