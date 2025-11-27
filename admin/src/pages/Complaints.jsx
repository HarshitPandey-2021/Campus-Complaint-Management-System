// src/pages/Complaints.jsx
import React, { useState, useEffect, useMemo } from "react";
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
import {
  RiDownloadLine,
  RiPrinterLine,
  RiArrowRightLine,
  RiCloseLine,
} from "react-icons/ri";
import { exportToCSV, exportToPrint } from "../utils/exportUtils";
import { logActivity, ACTIVITY_TYPES } from "../services/activityLogger";

const Complaints = () => {
  const location = useLocation();
  const { success, error } = useToast();

  // Handle dashboard filter navigation
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

  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await getAllComplaints(token);
        setComplaints(response);

        // Apply filters if any
        let filtered = response;

        // Filter by status
        if (filters.status && filters.status !== "All") {
          filtered = filtered.filter((c) => c.status === filters.status);
        }

        // Filter by search (title, description, department)
        if (filters.search && filters.search.trim() !== "") {
          const term = filters.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.title?.toLowerCase().includes(term) ||
              c.description?.toLowerCase().includes(term) ||
              c.department?.toLowerCase().includes(term)
          );
        }

        // Date range filter
        if (filters.dateRange && filters.dateRange !== "all") {
          const now = new Date();
          let threshold = new Date();

          if (filters.dateRange === "week") {
            threshold.setDate(now.getDate() - 7);
          } else if (filters.dateRange === "month") {
            threshold.setDate(now.getDate() - 30);
          } else if (filters.dateRange === "today") {
            threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          }

          filtered = filtered.filter((c) => {
            const date = new Date(c.createdAt || c.submittedAt || c.date);
            if (isNaN(date)) return false;

            if (filters.dateRange === "today") {
              // Match same calendar day
              const complaintDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              return complaintDate.getTime() === threshold.getTime();
            }

            return date >= threshold;
          });
        }

        setFilteredComplaints(filtered);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        error("❌ Failed to fetch complaints from the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
    // eslint-disable-next-line
  }, [filters, error]);

  // Handle filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ status: "", search: "", dateRange: "all" });
    success("🔄 Filters cleared!");
  };

  // Handle row click
  const handleRowClick = async (complaintId) => {
    try {
      const token = localStorage.getItem("token");
      const complaint = await getComplaintById(complaintId, token);
      setSelectedComplaint(complaint);
      setIsModalOpen(true);
    } catch (err) {
      error("⚠️ Failed to load complaint details.", err);
    }
  };

  // Update status
  const handleStatusUpdate = async (complaintId, newStatus, remarks) => {
    try {
      const token = localStorage.getItem("token");
      const updateSuccess = await updateComplaintStatus(
        complaintId,
        newStatus,
        token,
        remarks
      );

      if (updateSuccess) {
        logActivity(ACTIVITY_TYPES.STATUS_CHANGE, {
          complaintId,
          complaintSubject: selectedComplaint?.title || "Unknown",
          previousStatus: selectedComplaint?.status || "Unknown",
          newStatus,
          remarks: remarks || "No remarks provided",
        });

        success(`✅ Complaint #${complaintId} updated to ${newStatus}`);
        setIsModalOpen(false);
        setSelectedComplaint(null);

        // Refresh data
        const refreshed = await getAllComplaints(token);
        setComplaints(refreshed);
        setFilteredComplaints(refreshed);
      } else {
        error(`❌ Failed to update complaint #${complaintId}`);
      }
    } catch (err) {
      console.error(err);
      error("⚠️ Error while updating complaint status.");
    }
  };

  // Modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  // Export and print
  const handleExportCSV = () => {
    const filename = `complaints_${new Date().toISOString().split("T")[0]}.csv`;
    exportToCSV(filteredComplaints, filename);
    logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, {
      action: "Exported complaints to CSV",
      filename,
      complaintCount: filteredComplaints.length,
      filters,
    });
    success(`✅ Exported ${filteredComplaints.length} complaints to CSV!`);
  };

  const handlePrint = () => {
    exportToPrint(filteredComplaints);
    logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, {
      action: "Printed complaints",
      complaintCount: filteredComplaints.length,
      filters,
    });
    success("📄 Print preview opened");
  };

  // Determine empty state
  const getEmptyStateType = () => {
    if (filters.search) return "search";
    if (filters.status || filters.dateRange !== "all") return "filter";
    return "complaints";
  };

  // JSX
  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-0 page-enter">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Manage Complaints
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Filter and manage all campus complaints.
        </p>
      </div>

      <ComplaintFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Highlight Banner */}
      {filterHighlight && filters.status && (
        <div
          className={`mb-4 border-l-4 p-4 rounded-lg shadow-sm animate-slideDown relative ${
            filters.status === "Resolved"
              ? "border-green-600 bg-green-50 dark:bg-green-900/20"
              : filters.status === "Pending"
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : filters.status === "Rejected"
              ? "border-red-600 bg-red-50 dark:bg-red-900/20"
              : "border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {filters.status === "Resolved"
                ? "✅"
                : filters.status === "Pending"
                ? "⏳"
                : filters.status === "Rejected"
                ? "❌"
                : "🔧"}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Showing {filters.status} complaints
              </p>
              <p className="text-sm text-gray-500">
                Found {filteredComplaints.length} items
              </p>
            </div>
            <button
              onClick={() => setFilterHighlight(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <RiCloseLine />
            </button>
          </div>
        </div>
      )}

      {/* Header with Export */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700 border-b-0 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {isLoading ? "Loading..." : `${filteredComplaints.length} Complaints`}
        </h2>
        {filteredComplaints.length > 0 && !isLoading && (
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              <RiDownloadLine /> CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <RiPrinterLine /> Print
            </button>
          </div>
        )}
      </div>

      {/* Loading / Empty / Table */}
      {isLoading && <Loading type="table" />}
      {!isLoading && filteredComplaints.length === 0 && (
        <EmptyState
          type={getEmptyStateType()}
          searchTerm={filters.search}
          onAction={handleClearFilters}
          actionLabel="Clear All Filters"
        />
      )}
      {!isLoading && filteredComplaints.length > 0 && (
        <ComplaintTable
          complaints={filteredComplaints}
          onRowClick={handleRowClick}
          onActionClick={handleRowClick}
        />
      )}

      {/* Complaint Modal */}
      <ComplaintDetails
        complaint={selectedComplaint}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default Complaints;
