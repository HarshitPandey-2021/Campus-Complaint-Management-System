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

        setCategoryData(
          Object.entries(categoryRes || {}).map(([name, value]) => ({
            name,
            Complaints: value,
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
      {/* ... (rest of your Analytics UI as before) ... */}
    </div>
  );
};

// ... (reuse your subcomponents for MetricCard, PriorityCard, SummarySection, SummaryItem as before) ...

export default Analytics;
