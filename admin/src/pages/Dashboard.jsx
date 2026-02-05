// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import { useToast } from "../hooks/useToast";
import { useCountUp } from "../hooks/useCountUp";
import { getAllComplaints, getStats } from "../api";
import { getAdminUser, getAdminToken } from "../utils/tokenUtils";
import {
  RiFileListLine,
  RiTimeLine,
  RiLoader4Line,
  RiCheckLine,
  RiArrowRightLine,
  RiTrophyLine,
  RiTimerLine,
  RiFlashlightLine,
  RiArrowUpLine,
  RiArrowRightSLine,
} from "react-icons/ri";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    pending: 0, 
    inProgress: 0, 
    resolved: 0,
    rejected: 0 
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const { info, success } = useToast();
  const adminUser = getAdminUser();
  const adminToken = getAdminToken() || localStorage.getItem("token");

  const totalCount = useCountUp(stats.total, 1200, 0);
  const pendingCount = useCountUp(stats.pending, 1200, 0);
  const inProgressCount = useCountUp(stats.inProgress, 1200, 0);
  const resolvedCount = useCountUp(stats.resolved, 1200, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!adminToken) {
          info("Authentication token not found");
          setLoading(false);
          return;
        }

        const allComplaints = await getAllComplaints(adminToken);
        
        if (Array.isArray(allComplaints)) {
          const sorted = [...allComplaints].sort((a, b) => 
            (new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt))
          );
          setRecentComplaints(sorted.slice(0, 5));
        }

        const statsData = await getStats(adminToken);
        
        if (statsData) {
          const statsObj = statsData.stats || statsData;
          setStats({
            total: statsObj.total || 0,
            pending: statsObj.pending || 0,
            inProgress: statsObj.inProgress || 0,
            resolved: statsObj.resolved || 0,
            rejected: statsObj.rejected || 0,
          });
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        info("Failed to fetch data. Please refresh.");
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };

    if (adminToken) fetchData();
  }, [adminToken, info]);

  const welcomeToastRef = useRef(false);

  useEffect(() => {
    if (!dataLoaded || welcomeToastRef.current) return;

    const hasSeenWelcome = localStorage.getItem("dashboard-welcome-seen");
    
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        if (stats.pending > 0) {
          info(
            `Welcome back, ${adminUser?.name || "Admin"}! You have ${stats.pending} pending ${stats.pending === 1 ? "complaint" : "complaints"}.`
          );
        } else {
          success("Great work! All complaints are handled.");
        }
        
        localStorage.setItem("dashboard-welcome-seen", "true");
        welcomeToastRef.current = true;
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [dataLoaded, stats.pending, adminUser, info, success]);

  const handleStatClick = (status) => {
    navigate("/complaints", { state: { filterStatus: status } });
  };

  const handleComplaintRowClick = (e, complaintId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/complaints");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loading type="chart" />
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Complaints",
      value: totalCount,
      subtitle: "All time",
      icon: RiFileListLine,
      color: "indigo",
      status: "all",
    },
    {
      label: "Pending",
      value: pendingCount,
      subtitle: "Awaiting action",
      icon: RiTimeLine,
      color: "amber",
      status: "Pending",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      subtitle: "Being handled",
      icon: RiLoader4Line,
      color: "blue",
      status: "In Progress",
      spin: true,
    },
    {
      label: "Resolved",
      value: resolvedCount,
      subtitle: "Completed",
      icon: RiCheckLine,
      color: "emerald",
      status: "Resolved",
    },
  ];

  const colorClasses = {
    indigo: {
      icon: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-gray-200 dark:border-gray-800",
      hover: "hover:border-indigo-300 dark:hover:border-indigo-700",
    },
    amber: {
      icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-gray-200 dark:border-gray-800",
      hover: "hover:border-amber-300 dark:hover:border-amber-700",
    },
    blue: {
      icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-gray-200 dark:border-gray-800",
      hover: "hover:border-blue-300 dark:hover:border-blue-700",
    },
    emerald: {
      icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-gray-200 dark:border-gray-800",
      hover: "hover:border-emerald-300 dark:hover:border-emerald-700",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {adminUser?.name?.split(' ')[0] || "Admin"}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Here's a quick overview of all complaints and activities.
              </p>
            </div>
            <button
              onClick={() => navigate("/complaints")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              View All Complaints
              <RiArrowRightLine className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const colors = colorClasses[stat.color];
            const Icon = stat.icon;
            
            return (
              <div
                key={index}
                onClick={() => handleStatClick(stat.status)}
                className={`
                  relative bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 lg:p-6 
                  border ${colors.border} ${colors.hover}
                  cursor-pointer group
                  transition-all duration-300 ease-out
                  hover:shadow-xl hover:-translate-y-1
                  active:translate-y-0 active:shadow-lg
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.label}
                    </p>
                    <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 ${colors.text}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 hidden sm:block">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-2.5 lg:p-3 rounded-xl ${colors.icon} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.spin ? 'animate-spin' : ''}`} />
                  </div>
                </div>
                
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <RiArrowRightSLine className={`h-4 w-4 sm:h-5 sm:w-5 ${colors.text}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Complaints Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8">
          {/* Section Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <RiFileListLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Complaints
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Latest submissions requiring attention
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/complaints");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <RiArrowRightLine className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          {recentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                <RiFileListLine className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No complaints yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                New complaints will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table - Only table scrolls horizontally */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {recentComplaints.map((complaint, index) => (
                        <tr
                          key={complaint._id || complaint.id || index}
                          onClick={(e) => handleComplaintRowClick(e, complaint._id || complaint.id)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-xs">
                              {complaint.title || complaint.subject || "Untitled"}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                              {complaint.category || "General"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge status={complaint.status}>{complaint.status}</Badge>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(complaint.createdAt || complaint.submittedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                {recentComplaints.map((complaint, index) => (
                  <div
                    key={complaint._id || complaint.id || index}
                    onClick={(e) => handleComplaintRowClick(e, complaint._id || complaint.id)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {complaint.title || complaint.subject || "Untitled"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                            {complaint.category || "General"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(complaint.createdAt || complaint.submittedAt)}
                          </span>
                        </div>
                      </div>
                      <Badge status={complaint.status}>{complaint.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Resolution Rate */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <RiTrophyLine className="h-5 w-5 text-white/80" />
                <p className="text-sm font-medium text-white/80">Resolution Rate</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </p>
              <p className="text-sm text-white/70 mt-2">
                {stats.resolved} of {stats.total} resolved
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <RiTrophyLine className="h-24 w-24 sm:h-32 sm:w-32" />
            </div>
          </div>

          {/* Average Response */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 sm:p-6 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <RiTimerLine className="h-5 w-5 text-white/80" />
                <p className="text-sm font-medium text-white/80">Avg. Response</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">2.4 hrs</p>
              <div className="flex items-center gap-1 mt-2">
                <RiArrowUpLine className="h-4 w-4 text-emerald-200" />
                <p className="text-sm text-white/70">12% faster this week</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <RiTimerLine className="h-24 w-24 sm:h-32 sm:w-32" />
            </div>
          </div>

          {/* Active Rate */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 sm:p-6 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <RiFlashlightLine className="h-5 w-5 text-white/80" />
                <p className="text-sm font-medium text-white/80">Active Rate</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {stats.total > 0 ? Math.round(((stats.pending + stats.inProgress) / stats.total) * 100) : 0}%
              </p>
              <p className="text-sm text-white/70 mt-2">
                {stats.pending + stats.inProgress} active complaints
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <RiFlashlightLine className="h-24 w-24 sm:h-32 sm:w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;