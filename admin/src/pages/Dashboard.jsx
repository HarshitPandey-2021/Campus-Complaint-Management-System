// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
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
  });

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
          info("⚠️ Authentication token not found");
          setLoading(false);
          return;
        }

        const allComplaints = await getAllComplaints(adminToken);
        console.log("📦 Dashboard Complaints:", allComplaints);

        if (Array.isArray(allComplaints)) {
          const sorted = [...allComplaints].sort(
            (a, b) =>
              new Date(b.createdAt || b.submittedAt || 0) -
              new Date(a.createdAt || a.submittedAt || 0)
          );
          setRecentComplaints(sorted.slice(0, 5));
        }

        const statsData = await getStats(adminToken);
        console.log("📊 Dashboard Stats:", statsData);

        if (statsData) {
          setStats({
            total: statsData.total || 0,
            pending: statsData.pending || 0,
            inProgress: statsData.inProgress || 0,
            resolved: statsData.resolved || 0,
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        info("⚠️ Failed to fetch data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    if (adminToken) {
      fetchData();
    }
  }, [adminToken, info]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("dashboard-welcome-seen");
    if (!hasSeenWelcome && stats.total > 0) {
      setTimeout(() => {
        if (stats.pending > 0) {
          info(
            `Welcome back, ${adminUser?.name || "Admin"}! 👋 You have ${
              stats.pending
            } pending complaint${stats.pending > 1 ? "s" : ""}.`
          );
        } else {
          success("Great work! All complaints are handled. 🎉");
        }
        localStorage.setItem("dashboard-welcome-seen", "true");
      }, 1500);
    }
  }, [stats, adminUser, info, success]);

  const handleStatClick = (status) => {
    console.log("📊 Stat card clicked:", status);
    navigate("/complaints", { state: { filterStatus: status } });
  };

  const handleComplaintRowClick = (e, complaintId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔗 Complaint row clicked:", complaintId);
    console.log("🚀 Navigating to /complaints");
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
    <div className="p-4 sm:p-6 lg:p-8 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome back, {adminUser?.name || "Admin"}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's a quick overview of all complaints and activities.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Complaints Card */}
        <div
          onClick={() => handleStatClick("all")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Total Complaints
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">
                {totalCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All time
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
              <RiFileListLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div
          onClick={() => handleStatClick("Pending")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Pending
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {pendingCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Awaiting action
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full">
              <RiTimeLine className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* In Progress Card */}
        <div
          onClick={() => handleStatClick("In Progress")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                In Progress
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {inProgressCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Being handled
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <RiLoader4Line className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          </div>
        </div>

        {/* Resolved Card */}
        <div
          onClick={() => handleStatClick("Resolved")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Resolved
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {resolvedCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Completed
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <RiCheckLine className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <RiFileListLine className="h-6 w-6" />
            Recent Complaints
          </h3>
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log("📋 View All button clicked");
              navigate("/complaints");
            }}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors text-sm active:scale-95"
          >
            View All
            <RiArrowRightLine className="h-4 w-4" />
          </button>
        </div>

        {recentComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((complaint, index) => {
                  const complaintId = complaint._id || complaint.id;
                  
                  console.log(`🔍 Row ${index} data:`, {
                    _id: complaintId,
                    title: complaint.title,
                    subject: complaint.subject,
                    category: complaint.category,
                    status: complaint.status,
                    createdAt: complaint.createdAt,
                    submittedAt: complaint.submittedAt,
                  });

                  return (
                    <tr
                      key={complaintId || index}
                      onClick={(e) => handleComplaintRowClick(e, complaintId)}
                      onMouseEnter={() => console.log("🖱️ Mouse enter row", index)}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer group active:bg-indigo-100 dark:active:bg-gray-700"
                      style={{ userSelect: 'none' }}
                    >
                      <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                        <div className="truncate max-w-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {complaint.title ||
                            complaint.subject ||
                            "Untitled Complaint"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {complaint.category ||
                          complaint.department ||
                          "General"}
                      </td>
                      <td className="py-4 px-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Badge status={complaint.status || "Pending"} />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(
                          complaint.createdAt ||
                            complaint.submittedAt ||
                            complaint.date
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <RiFileListLine className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No complaints yet. Great work! 🎉
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All complaints are resolved.
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-lg p-4 sm:p-6 border border-indigo-200 dark:border-indigo-900/30 hover:shadow-md transition-shadow">
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
            Resolution Rate
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-900 dark:text-indigo-200 mt-1">
            {stats.total > 0
              ? Math.round((stats.resolved / stats.total) * 100)
              : 0}
            %
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-900/30 hover:shadow-md transition-shadow">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            Average Response
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-200 mt-1">
            2.4 hrs
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-900/30 hover:shadow-md transition-shadow">
          <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            Satisfaction
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-200 mt-1">
            4.8/5 ⭐
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

