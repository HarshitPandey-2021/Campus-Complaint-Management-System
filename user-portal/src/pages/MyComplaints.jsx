// src/pages/MyComplaints.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiEditLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCloseCircleLine,
  RiLoader4Line,
  RiDownloadLine,
} from "react-icons/ri";
import Sidebar from "../components/layout/Sidebar";
import api from "../api";

const MyComplaints = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // initial status from Dashboard navigate state (if any)
  const initialStatus = location.state?.filterStatus
    ? location.state.filterStatus.toLowerCase()
    : "all";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

  // optional: clear state in URL after applying filter once
  useEffect(() => {
    if (location.state?.filterStatus) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = await api.getMyComplaints(token);
      setComplaints(Array.isArray(data) ? data : []);
      if (data && data.length) {
        console.log("Sample Complaint:", data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending":
        return <RiTimeLine className="w-5 h-5 text-yellow-500" />;
      case "in-progress":
      case "in progress":
        return <RiAlertLine className="w-5 h-5 text-blue-500" />;
      case "resolved":
        return <RiCheckboxCircleLine className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <RiCloseCircleLine className="w-5 h-5 text-red-500" />;
      default:
        return <RiTimeLine className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in-progress":
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case "high":
        return "text-red-600 dark:text-red-400 font-semibold";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 font-semibold";
      case "low":
        return "text-green-600 dark:text-green-400 font-semibold";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subject
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.complaintId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      complaint.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      complaint.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const ComplaintCard = ({ complaint }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {complaint.complaintId}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                complaint.status
              )}`}
            >
              {complaint.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
            {complaint.subject}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {complaint.description}
          </p>
        </div>
        <div className="ml-4">{getStatusIcon(complaint.status)}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Category:
          </span>
          <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
            {complaint.category}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Priority:
          </span>
          <span
            className={`ml-2 ${getPriorityColor(complaint.priority)}`}
          >
            {complaint.priority}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Location:
          </span>
          <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
            {complaint.location}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Date:
          </span>
          <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
            {complaint.submittedAt
              ? new Date(
                  complaint.submittedAt
                ).toLocaleDateString("en-IN")
              : "N/A"}
          </span>
        </div>
      </div>

      {complaint.assignedTo && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm border border-blue-200 dark:border-blue-700">
          <span className="text-gray-600 dark:text-gray-400">
            Assigned to:
          </span>
          <span className="ml-2 font-semibold text-blue-700 dark:text-blue-400">
            {complaint.assignedTo.name || complaint.assignedTo}
          </span>
        </div>
      )}

      {/* PDF Download */}
      {complaint.pdfDocument && (
        <a
          href={complaint.pdfDocument}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-600 hover:underline text-xs mb-2"
        >
          <RiDownloadLine className="w-4 h-4" />
          <span>Download PDF</span>
        </a>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/user/complaints/${complaint._id}`)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors font-semibold"
        >
          <RiEyeLine className="w-4 h-4" />
          View Details
        </button>
        {complaint.status?.toLowerCase() === "pending" &&
          !complaint.assignedTo && (
            <button
              onClick={() =>
                navigate(`/user/complaints/${complaint._id}/edit`)
              }
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors font-semibold"
            >
              <RiEditLine className="w-4 h-4" />
              Edit
            </button>
          )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
            My Complaints
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your submitted complaints
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none dark:bg-gray-700 dark:text-gray-200 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none dark:bg-gray-700 dark:text-gray-200 transition-all cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Fan">Fan</option>
                <option value="Light">Light</option>
                <option value="Projector">Projector</option>
                <option value="Furniture">Furniture</option>
                <option value="Washroom">Washroom</option>
                <option value="Water">Water</option>
                <option value="Internet">Internet</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* List / Empty / Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <RiLoader4Line className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading complaints...
            </p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <RiAlertLine className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No complaints found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ||
              statusFilter !== "all" ||
              categoryFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "You haven't submitted any complaints yet"}
            </p>
            {!searchTerm &&
              statusFilter === "all" &&
              categoryFilter === "all" && (
                <button
                  onClick={() => navigate("/user/submit")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors font-semibold"
                >
                  Submit Your First Complaint
                </button>
              )}
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {filteredComplaints.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {complaints.length}
                </span>{" "}
                complaints
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard key={complaint._id} complaint={complaint} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
