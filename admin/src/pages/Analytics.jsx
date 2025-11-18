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
} from "../services/adminService";
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

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
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

        // Convert objects to arrays for Recharts (if needed)
        setCategoryData(
          Object.entries(categoryRes || {}).map(([name, value]) => ({
            name,
            Complaints:value,
          }))
        );
        setStatusData(
          Object.entries(statusRes || {}).map(([name, value]) => ({
            name,
            value,
          }))
        );
        setTrendData(
          Object.entries(trendRes || {}).map(([name, value]) => ({
            name,
            value,
          }))
        );
        setPriorityData(
          Object.entries(priorityRes || {}).map(([name, value]) => ({
            name,
            value,
          }))
        );
        setAvgResolutionTime(avgTimeRes || 0);
        setStats(statsRes || stats);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [token]);

  
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
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Analytics & Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive insights and visualizations of complaint data.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Complaints */}
        <MetricCard
          label="Total Complaints"
          value={stats.total}
          icon={<RiBarChartFill />}
          color="indigo"
        />

        {/* Resolution Rate */}
        <MetricCard
          label="Resolution Rate"
          value={
            stats.total > 0
              ? `${Math.round((stats.resolved / stats.total) * 100)}%`
              : "0%"
          }
          icon={<RiPieChartFill />}
          color="green"
        />

        {/* Pending Complaints */}
        <MetricCard
          label="Pending"
          value={stats.pending}
          icon={<RiLineChartFill />}
          color="blue"
        />

        {/* Avg Resolution Time */}
        <MetricCard
          label="Avg Resolution"
          value={`${avgResolutionTime}h`}
          icon={<RiTimeLine />}
          color="yellow"
        />
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
            <PriorityCard
              key={priority.name}
              priority={priority}
              total={stats.total}
            />
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <SummarySection stats={stats} avgResolutionTime={avgResolutionTime} />
    </div>
  );
};

/* ================================
   📦 Reusable Subcomponents
================================ */
const MetricCard = ({ label, value, icon, color }) => (
  <div
    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">
          {value}
        </p>
      </div>
      <div
        className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-full flex items-center justify-center`}
      >
        {React.cloneElement(icon, {
          className: `h-6 w-6 text-${color}-600 dark:text-${color}-400`,
        })}
      </div>
    </div>
  </div>
);

const PriorityCard = ({ priority, total }) => {
  const color =
    priority.name === "High"
      ? "red"
      : priority.name === "Medium"
      ? "yellow"
      : "green";

  return (
    <div
      className={`p-4 rounded-lg border bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium text-${color}-600 dark:text-${color}-400`}
          >
            {priority.name} Priority
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
            {priority.value}
          </p>
        </div>
        <div className={`text-3xl text-${color}-600 dark:text-${color}-400`}>
          {priority.name === "High"
            ? "🔴"
            : priority.name === "Medium"
            ? "🟡"
            : "🟢"}
        </div>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-${color}-600 dark:bg-${color}-500`}
            style={{
              width: `${((priority.value / total) * 100).toFixed(1)}%`,
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {((priority.value / total) * 100).toFixed(1)}% of total
        </p>
      </div>
    </div>
  );
};

const SummarySection = ({ stats, avgResolutionTime }) => (
  <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
      📊 Quick Summary
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <SummaryItem color="indigo" text={`${stats.total} total complaints`} />
      <SummaryItem
        color="green"
        text={`${stats.resolved} successfully resolved`}
      />
      <SummaryItem color="blue" text={`${stats.pending} awaiting review`} />
      <SummaryItem
        color="yellow"
        text={`${stats.inProgress} currently in progress`}
      />
      <SummaryItem
        color="purple"
        text={`Average resolution time: ${avgResolutionTime} hours`}
      />
      <SummaryItem color="red" text={`${stats.rejected} complaints rejected`} />
    </div>
  </div>
);

const SummaryItem = ({ color, text }) => (
  <div className="flex items-start gap-2">
    <span
      className={`text-${color}-600 dark:text-${color}-400 font-bold leading-5`}
    >
      •
    </span>
    <p className="text-gray-700 dark:text-gray-300">{text}</p>
  </div>
);

export default Analytics;
