// src/pages/Dashboard.jsx (User Portal)
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
          window.location.href = "http://localhost:5174/login";
          return;
        }

        const complaints = await getMyComplaints(token);
        const userStats = await getMyStats(token);

        if (Array.isArray(complaints)) {
          setRecentComplaints(complaints.slice(0, 5));
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
        info(`Welcome back, ${user.name}! You have ${stats.pending} complaint${stats.pending > 1 ? "s" : ""} waiting.`);
      } else if (stats.total > 0) {
        success("Great! All your complaints are being handled!");
      } else {
        info(`Welcome, ${user.name}! Submit your first complaint to get started.`);
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
      label: "Total Complaints",
      value: totalCount,
      icon: RiFileListLine,
      gradient: "from-indigo-500 to-indigo-600",
      status: "all",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: RiTimeLine,
      gradient: "from-amber-500 to-amber-600",
      status: "Pending",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: RiLoader4Line,
      gradient: "from-blue-500 to-blue-600",
      status: "In Progress",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      icon: RiCheckLine,
      gradient: "from-emerald-500 to-emerald-600",
      status: "Resolved",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Here's an overview of your complaints and their current status
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => handleStatClick(stat.status)}
                className={`bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg p-4 sm:p-6 text-white cursor-pointer transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 active:scale-100`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                </div>
                <div className="text-xs sm:text-sm font-medium opacity-90">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate("/user/submit")}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group text-left"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                <RiAddCircleLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Submit New Complaint
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Report a new issue
                </p>
              </div>
              <RiArrowRightSLine className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          <button
            onClick={() => navigate("/user/my-complaints")}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all group text-left"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <RiFileListLine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  View All Complaints
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your submissions
                </p>
              </div>
              <RiArrowRightSLine className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <RiFileListLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Complaints
              </h2>
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
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl inline-block mb-4">
                <RiFileListLine className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Complaints Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start by submitting your first complaint
              </p>
              <button
                onClick={() => navigate("/user/submit")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
              >
                Submit Complaint
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  onClick={() => navigate(`/user/complaints/${complaint._id}`)}
                  className="p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white flex-1 truncate">
                      {complaint.title || complaint.subject}
                    </h3>
                    <Badge status={complaint.status} />
                  </div>
                  <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 gap-3">
                    {complaint.location && (
                      <span className="flex items-center gap-1">
                        <RiMapPinLine className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">{complaint.location}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <RiCalendarLine className="h-3.5 w-3.5" />
                      {formatDate(complaint.submittedAt || complaint.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;