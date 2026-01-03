// src/pages/Dashboard.jsx (user portal - 3001)
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

  // Fetch complaints + stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("No token found, redirecting to landing login");
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

  // ONE-TIME welcome toast PER SESSION
  const welcomeShownRef = useRef(false);

  useEffect(() => {
    console.log("💡 Dashboard toast effect:", {
      loading,
      hasUser: !!user,
      stats,
      flag: sessionStorage.getItem("user-dashboard-welcome-seen"),
    });

    if (loading) return;
    if (!user) return;

    if (welcomeShownRef.current) return;

    const hasSeenWelcome =
      sessionStorage.getItem("user-dashboard-welcome-seen") === "true";

    if (hasSeenWelcome) {
      welcomeShownRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      if (stats.pending > 0) {
        info(
          `Welcome back, ${user.name}! You have ${stats.pending} complaint${
            stats.pending > 1 ? "s" : ""
          } waiting to be reviewed.`
        );
      } else if (stats.total > 0) {
        success("Great! All your complaints are being handled or resolved!");
      } else {
        info(
          `Welcome, ${user.name}! Submit your first complaint to get started.`
        );
      }

      sessionStorage.setItem("user-dashboard-welcome-seen", "true");
      welcomeShownRef.current = true;
      console.log(
        "✅ Toast shown & session flag set:",
        sessionStorage.getItem("user-dashboard-welcome-seen")
      );
    }, 1200);

    return () => clearTimeout(timer);
  }, [loading, user, stats.pending, stats.total, info, success]);

  const handleStatClick = (status) => {
    // yahi state MyComplaints me read hogi
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
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Here&apos;s an overview of your complaints and their current status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Complaints */}
        <div
          onClick={() => handleStatClick("all")}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <RiFileListLine className="h-8 w-8 opacity-80" />
            <div className="text-3xl font-bold">{totalCount}</div>
          </div>
          <div className="text-sm font-medium opacity-90">
            Total Complaints
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => handleStatClick("Pending")}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <RiTimeLine className="h-8 w-8 opacity-80" />
            <div className="text-3xl font-bold">{pendingCount}</div>
          </div>
          <div className="text-sm font-medium opacity-90">Pending</div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => handleStatClick("In Progress")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <RiLoader4Line className="h-8 w-8 opacity-80" />
            <div className="text-3xl font-bold">{inProgressCount}</div>
          </div>
          <div className="text-sm font-medium opacity-90">In Progress</div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => handleStatClick("Resolved")}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <RiCheckLine className="h-8 w-8 opacity-80" />
            <div className="text-3xl font-bold">{resolvedCount}</div>
          </div>
          <div className="text-sm font-medium opacity-90">Resolved</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <button
          onClick={() => navigate("/user/submit")}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
              <RiAddCircleLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Submit New Complaint
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Report a new issue
              </p>
            </div>
            <RiArrowRightLine className="ml-auto h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => navigate("/user/my-complaints")}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <RiFileListLine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                View All Complaints
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your submissions
              </p>
            </div>
            <RiArrowRightLine className="ml-auto h-5 w-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Recent Complaints
          </h2>
          {recentComplaints.length > 0 && (
            <button
              onClick={() => navigate("/user/my-complaints")}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              View All
            </button>
          )}
        </div>

        {recentComplaints.length === 0 ? (
          <div className="text-center py-12">
            <RiFileListLine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No Complaints Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by submitting your first complaint
            </p>
            <button
              onClick={() => navigate("/user/submit")}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
            >
              Submit Complaint
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <div
                key={complaint._id}
                onClick={() =>
                  navigate(`/user/complaints/${complaint._id}`)
                }
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex-1 pr-4">
                    {complaint.title || complaint.subject}
                  </h3>
                  <Badge status={complaint.status} />
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 flex-wrap gap-2">
                  {complaint.location && (
                    <span className="flex items-center">
                      <RiMapPinLine className="h-4 w-4 mr-1" />
                      {complaint.location}
                    </span>
                  )}
                  {complaint.submittedAt && (
                    <span className="flex items-center">
                      <RiCalendarLine className="h-4 w-4 mr-1" />
                      {formatDate(
                        complaint.submittedAt || complaint.createdAt
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
