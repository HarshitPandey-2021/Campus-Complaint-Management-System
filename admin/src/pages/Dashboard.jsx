// src/pages/Dashboard.jsx - FINAL POLISHED VERSION
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
  RiImageLine,
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
            `Welcome back, ${adminUser?.name?.split(' ')[0] || "Admin"}! You have ${stats.pending} pending complaint${stats.pending === 1 ? "" : "s"}.`
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

  const handleViewAllComplaints = () => {
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

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 min-h-screen">
        <Loading type="chart" />
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total",
      value: totalCount,
      subtitle: "All complaints",
      icon: RiFileListLine,
      gradient: "from-indigo-500 to-purple-600",
      status: "all",
    },
    {
      label: "Pending",
      value: pendingCount,
      subtitle: "Awaiting action",
      icon: RiTimeLine,
      gradient: "from-amber-500 to-orange-600",
      status: "Pending",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      subtitle: "Being handled",
      icon: RiLoader4Line,
      gradient: "from-blue-500 to-cyan-600",
      status: "In Progress",
      spin: true,
    },
    {
      label: "Resolved",
      value: resolvedCount,
      subtitle: "Completed",
      icon: RiCheckLine,
      gradient: "from-emerald-500 to-teal-600",
      status: "Resolved",
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-y-auto overflow-x-hidden min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* ========== HEADER ========== */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {adminUser?.name?.split(' ')[0] || "Admin"}! 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Here's your campus complaints overview
              </p>
            </div>
            <button
              onClick={handleViewAllComplaints}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
              View All Complaints
              <RiArrowRightLine className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <button
                key={index}
                onClick={() => handleStatClick(stat.status)}
                className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-left w-full overflow-hidden"
              >
                {/* Background Gradient Accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 hidden sm:block">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg flex-shrink-0`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-white ${stat.spin ? 'animate-spin' : ''}`} />
                  </div>
                </div>
                
                {/* Hover Arrow */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <RiArrowRightSLine className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* ========== RECENT COMPLAINTS ========== */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mb-6 overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <RiFileListLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Complaints
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Latest {recentComplaints.length} submissions
                </p>
              </div>
            </div>
            <button
              onClick={handleViewAllComplaints}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
            >
              View All
              <RiArrowRightLine className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          {recentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                <RiFileListLine className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No complaints yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                New complaints will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentComplaints.map((complaint, index) => {
                const hasImage = complaint.images?.length > 0;
                
                return (
                  <div
                    key={complaint._id || complaint.id || index}
                    onClick={handleViewAllComplaints}
                    className="flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {hasImage ? (
                        <img
                          src={complaint.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RiImageLine className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {complaint.title || complaint.subject || "Untitled"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate max-w-[80px] sm:max-w-[120px]">
                          {complaint.category || "General"}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="flex-shrink-0">{formatTimeAgo(complaint.createdAt || complaint.submittedAt)}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <Badge status={complaint.status} size="small" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== QUICK STATS FOOTER ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Resolution Rate */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-5 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <RiTrophyLine className="h-4 w-4 text-white/80" />
                <p className="text-xs sm:text-sm font-medium text-white/80">Resolution Rate</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                {stats.resolved} of {stats.total} resolved
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <RiTrophyLine className="h-24 w-24 sm:h-28 sm:w-28" />
            </div>
          </div>

          {/* Average Response */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-5 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <RiTimerLine className="h-4 w-4 text-white/80" />
                <p className="text-xs sm:text-sm font-medium text-white/80">Avg. Response</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">2.4 hrs</p>
              <div className="flex items-center gap-1 mt-1">
                <RiArrowUpLine className="h-3 w-3 text-emerald-200" />
                <p className="text-xs sm:text-sm text-white/70">12% faster</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <RiTimerLine className="h-24 w-24 sm:h-28 sm:w-28" />
            </div>
          </div>

          {/* Active Rate */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 sm:p-5 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <RiFlashlightLine className="h-4 w-4 text-white/80" />
                <p className="text-xs sm:text-sm font-medium text-white/80">Active Rate</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {stats.total > 0 ? Math.round(((stats.pending + stats.inProgress) / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                {stats.pending + stats.inProgress} active
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <RiFlashlightLine className="h-24 w-24 sm:h-28 sm:w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;