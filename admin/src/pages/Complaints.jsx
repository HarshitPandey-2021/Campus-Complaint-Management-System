// src/pages/Complaints.jsx - COMPLETE FIXED
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ComplaintFilters from "../components/ComplaintFilters";
import ComplaintTable from "../components/ComplaintTable/myComplaintTable";
import ComplaintDetails from "../components/ComplaintDetails";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import { useToast } from "../hooks/useToast";
import {
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById,
} from "../api";
import { getAdminToken } from "../utils/tokenUtils";
import {
  RiDownloadLine,
  RiPrinterLine,
  RiCloseLine,
} from "react-icons/ri";
import { exportToCSV, exportToPrint } from "../utils/exportUtils";
import { logActivity, ACTIVITY_TYPES } from "../services/activityLogger";

const Complaints = () => {
  const location = useLocation();
  const { success, error } = useToast();

  const initialFilters = useMemo(() => {
    if (location.state?.filterStatus) {
      const filterValue = location.state.filterStatus;
      window.history.replaceState({}, document.title);
      return {
        status: filterValue === "all" ? "" : filterValue,
        search: "",
        dateRange: "all",
      };
    }
    return { status: "", search: "", dateRange: "all" };
  }, [location.state]);

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterHighlight, setFilterHighlight] = useState(
    !!location.state?.filterStatus
  );

  const token = getAdminToken() || localStorage.getItem("token");

  const applyFilters = useCallback((complaintsToFilter, currentFilters) => {
    let filtered = [...complaintsToFilter];

    if (currentFilters.status && currentFilters.status !== "All") {
      filtered = filtered.filter((c) => c.status === currentFilters.status);
    }

    if (currentFilters.search && currentFilters.search.trim() !== "") {
      const term = currentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.subject?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.category?.toLowerCase().includes(term)
      );
    }

    if (currentFilters.dateRange && currentFilters.dateRange !== "all") {
      const now = new Date();
      let threshold = new Date();

      if (currentFilters.dateRange === "week") {
        threshold.setDate(now.getDate() - 7);
      } else if (currentFilters.dateRange === "month") {
        threshold.setDate(now.getDate() - 30);
      } else if (currentFilters.dateRange === "today") {
        threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      filtered = filtered.filter((c) => {
        const date = new Date(c.createdAt || c.submittedAt || c.date);
        if (isNaN(date)) return false;

        if (currentFilters.dateRange === "today") {
          const complaintDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          return complaintDate.getTime() === threshold.getTime();
        }

        return date >= threshold;
      });
    }

    setFilteredComplaints(filtered);
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);

        if (!token) {
          error("❌ No authentication token found");
          setIsLoading(false);
          return;
        }

        const response = await getAllComplaints(token);
        console.log("📦 Complaints fetched:", response?.length || 0);

        if (!Array.isArray(response)) {
          console.error("Response is not an array:", response);
          setComplaints([]);
          setFilteredComplaints([]);
          setIsLoading(false);
          return;
        }

        setComplaints(response);
        applyFilters(response, initialFilters);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        error("❌ Failed to fetch complaints from the server.");
        setComplaints([]);
        setFilteredComplaints([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchComplaints();
    }
  }, [token, applyFilters, initialFilters, error]);

  useEffect(() => {
    applyFilters(complaints, filters);
  }, [filters, complaints, applyFilters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ status: "", search: "", dateRange: "all" });
    setFilterHighlight(false);
    success("🔄 Filters cleared!");
  }, [success]);

  const handleRowClick = useCallback(
    async (complaintId) => {
      console.log("🎯 handleRowClick FIRED with ID:", complaintId);

      try {
        if (!complaintId) {
          console.error("❌ No complaint ID provided");
          error("⚠️ Invalid complaint ID");
          return;
        }

        console.log("🔍 Fetching complaint details for:", complaintId);
        const complaintDetails = await getComplaintById(complaintId, token);
        console.log("✅ Complaint details fetched:", complaintDetails);

        setSelectedComplaint(complaintDetails);
        setIsModalOpen(true);
        console.log("✅ Modal state set - isOpen: true");

        logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
          page: "Complaints",
          complaintId,
          complaintTitle:
            complaintDetails?.title || complaintDetails?.subject || "Unknown",
          action: "Viewed complaint details",
        });
      } catch (err) {
        console.error("❌ Error loading complaint:", err);
        error("⚠️ Failed to load complaint details.");
      }
    },
    [token, error]
  );

  const handleStatusUpdate = useCallback(
    async (complaintId, newStatus, remarks) => {
      console.log("📝 handleStatusUpdate called:", { complaintId, newStatus, remarks });

      try {
        const updateSuccess = await updateComplaintStatus(
          complaintId,
          newStatus,
          token,
          remarks
        );

        if (updateSuccess) {
          logActivity(ACTIVITY_TYPES.STATUS_CHANGE, {
            complaintId,
            complaintSubject:
              selectedComplaint?.title ||
              selectedComplaint?.subject ||
              "Unknown",
            previousStatus: selectedComplaint?.status || "Unknown",
            newStatus,
            remarks: remarks || "No remarks provided",
          });

          success(`✅ Complaint updated to ${newStatus}`);
          setIsModalOpen(false);
          setSelectedComplaint(null);

          const refreshed = await getAllComplaints(token);
          if (Array.isArray(refreshed)) {
            setComplaints(refreshed);
            applyFilters(refreshed, filters);
          }
        } else {
          error(`❌ Failed to update complaint`);
        }
      } catch (err) {
        console.error("Error updating complaint:", err);
        error("⚠️ Error while updating complaint status.");
      }
    },
    [token, selectedComplaint, filters, applyFilters, success, error]
  );

  const handleCloseModal = useCallback(() => {
    console.log("🚪 Closing modal");
    setIsModalOpen(false);
    setSelectedComplaint(null);
  }, []);

  const handleExportCSV = useCallback(() => {
    try {
      const filename = `complaints_${new Date().toISOString().split("T")[0]}.csv`;
      exportToCSV(filteredComplaints, filename);

      logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, {
        action: "Exported complaints to CSV",
        filename,
        complaintCount: filteredComplaints.length,
        filters,
      });

      success(
        `✅ Exported ${filteredComplaints.length} complaint${
          filteredComplaints.length !== 1 ? "s" : ""
        } to CSV!`
      );
    } catch (err) {
      console.error("Export error:", err);
      error("❌ Failed to export complaints");
    }
  }, [filteredComplaints, filters, success, error]);

  const handlePrint = useCallback(() => {
    try {
      exportToPrint(filteredComplaints);

      logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, {
        action: "Printed complaints",
        complaintCount: filteredComplaints.length,
        filters,
      });

      success("📄 Print preview opened");
    } catch (err) {
      console.error("Print error:", err);
      error("❌ Failed to print complaints");
    }
  }, [filteredComplaints, filters, success, error]);

  const getEmptyStateType = () => {
    if (filters.search) return "search";
    if (filters.status || filters.dateRange !== "all") return "filter";
    return "complaints";
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Loading type="table" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Container */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
            Manage Complaints
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Filter and manage all campus complaints efficiently.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <ComplaintFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </div>

        {/* Filter Highlight Banner */}
        {filterHighlight && filters.status && (
          <div
            className={`mb-4 border-l-4 p-4 rounded-lg shadow-sm animate-slideDown relative ${
              filters.status === "Resolved"
                ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                : filters.status === "Pending"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : filters.status === "In Progress"
                ? "border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-red-600 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">
                {filters.status === "Resolved"
                  ? "✅"
                  : filters.status === "Pending"
                  ? "⏳"
                  : filters.status === "In Progress"
                  ? "🔧"
                  : "❌"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  Showing {filters.status} complaints
                </p>
                <p className="text-sm text-gray-500">
                  Found {filteredComplaints.length} item
                  {filteredComplaints.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setFilterHighlight(false)}
                className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close filter banner"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Table Header with Export */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700 border-b-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
              {filteredComplaints.length} Complaint
              {filteredComplaints.length !== 1 ? "s" : ""}
            </h2>
            {filteredComplaints.length > 0 && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all text-sm font-medium"
                >
                  <RiDownloadLine className="h-4 w-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all text-sm font-medium"
                >
                  <RiPrinterLine className="h-4 w-4" />
                  <span>Print</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        {filteredComplaints.length === 0 ? (
          <EmptyState
            type={getEmptyStateType()}
            searchTerm={filters.search}
            onAction={handleClearFilters}
            actionLabel="Clear All Filters"
          />
        ) : (
          <ComplaintTable
            complaints={
filteredComplaints}
            onRowClick={handleRowClick}
            onActionClick={handleRowClick}
          />
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && isModalOpen && (
        <ComplaintDetails
          complaint={selectedComplaint}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default Complaints;
