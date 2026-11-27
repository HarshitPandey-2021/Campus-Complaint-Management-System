// src/pages/Dashboard.jsx - COMPLETE MOBILE RESPONSIVE VERSION
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import Badge from "../components/common/Badge";
import Loading from "../components/common/Loading";
import useCountUp from "../hooks/useCountUp";
import { getMyComplaints, getMyStats } from "../api";
import {
  RiFileListLine,
  RiTimeLine,
  RiLoader4Line,
  RiCheckLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiAddCircleLine,
  RiMapPinLine,
  RiArrowRightSLine,
  RiImageLine,
} from "react-icons/ri";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { info, success } = useToast();

  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  const totalCount = useCountUp(stats.total, 1200, 0);
  const pendingCount = useCountUp(stats.pending, 1200, 0);
  const inProgressCount = useCountUp(stats.inProgress, 1200, 0);
  const resolvedCount = useCountUp(stats.resolved, 1200, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href =
            (import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5174") +
            "/login";
          return;
        }

        const complaints = await getMyComplaints(token);
        const userStats = await getMyStats(token);

        if (Array.isArray(complaints)) {
          const sorted = [...complaints].sort((a, b) => 
            new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt)
          );
          setRecentComplaints(sorted.slice(0, 5));
        }

        if (userStats) {
          setStats({
            total: userStats.total || 0,
            pending: userStats.pending || 0,
            inProgress: userStats.inProgress || 0,
            resolved: userStats.resolved || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        info("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [info]);

  const welcomeShownRef = useRef(false);

  useEffect(() => {
    if (loading || !user || welcomeShownRef.current) return;

    const hasSeenWelcome = sessionStorage.getItem("user-dashboard-welcome-seen") === "true";
    if (hasSeenWelcome) {
      welcomeShownRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      if (stats.pending > 0) {
        info(`Welcome back, ${user.name?.split(' ')[0]}! You have ${stats.pending} complaint${stats.pending > 1 ? "s" : ""} waiting.`);
      } else if (stats.total > 0) {
        success("Great! All your complaints are being handled!");
      } else {
        info(`Welcome, ${user.name?.split(' ')[0]}! Submit your first complaint to get started.`);
      }

      sessionStorage.setItem("user-dashboard-welcome-seen", "true");
      welcomeShownRef.current = true;
    }, 1200);

    return () => clearTimeout(timer);
  }, [loading, user, stats.pending, stats.total, info, success]);

  const handleStatClick = (status) => {
    navigate("/user/my-complaints", { state: { filterStatus: status } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loading />
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total",
      value: totalCount,
      icon: RiFileListLine,
      gradient: "from-indigo-500 to-purple-600",
      status: "all",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: RiTimeLine,
      gradient: "from-amber-500 to-orange-600",
      status: "Pending",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: RiLoader4Line,
      gradient: "from-blue-500 to-cyan-600",
      status: "In Progress",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      icon: RiCheckLine,
      gradient: "from-emerald-500 to-teal-600",
      status: "Resolved",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's an overview of your complaints and their status
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <button
                key={index}
                onClick={() => handleStatClick(stat.status)}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-4 sm:p-5 text-white cursor-pointer transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 active:scale-100 text-left`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-xl flex-shrink-0">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {stat.value}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-medium opacity-90">
                  {stat.label}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Icon className="h-20 w-20 sm:h-24 sm:w-24" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => navigate("/user/submit")}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group text-left"
          >
            <div className="flex items-center">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors flex-shrink-0">
                <RiAddCircleLine className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Submit New Complaint
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Report a new issue
                </p>
              </div>
              <RiArrowRightSLine className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>

          <button
            onClick={() => navigate("/user/my-complaints")}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all group text-left"
          >
            <div className="flex items-center">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors flex-shrink-0">
                <RiFileListLine className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  View All Complaints
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage submissions
                </p>
              </div>
              <RiArrowRightSLine className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <RiFileListLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Complaints
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Latest {recentComplaints.length} submissions
                </p>
              </div>
            </div>
            {recentComplaints.length > 0 && (
              <button
                onClick={() => navigate("/user/my-complaints")}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                View All
                <RiArrowRightLine className="h-4 w-4" />
              </button>
            )}
          </div>

          {recentComplaints.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl inline-block mb-4">
                <RiFileListLine className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Complaints Yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Start by submitting your first complaint
              </p>
              <button
                onClick={() => navigate("/user/submit")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all"
              >
                Submit Complaint
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentComplaints.map((complaint) => {
                const hasImage = complaint.images?.length > 0;
                
                return (
                  <div
                    key={complaint._id}
                    onClick={() => navigate(`/user/complaints/${complaint._id}`)}
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
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {complaint.title || complaint.subject}
                        </h3>
                        <Badge status={complaint.status} size="small" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {complaint.location && (
                          <>
                            <span className="flex items-center gap-1 truncate max-w-[100px] sm:max-w-[150px]">
                              <RiMapPinLine className="h-3 w-3 flex-shrink-0" />
                              {complaint.location}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                          </>
                        )}
                        <span className="flex-shrink-0">{formatTimeAgo(complaint.submittedAt || complaint.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;