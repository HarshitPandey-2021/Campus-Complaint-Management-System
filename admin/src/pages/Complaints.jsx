// src/pages/Complaints.jsx - CLEAN VERSION
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ComplaintFilters from "../components/ComplaintFilters";
import ComplaintTable from "../components/ComplaintTable";
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
  RiFileList3Line,
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
        priority: "",
      };
    }
    return { status: "", search: "", dateRange: "all", priority: "" };
  }, [location.state]);

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterHighlight, setFilterHighlight] = useState(
    !!location.state?.filterStatus
  );

  const token = getAdminToken() || localStorage.getItem("token");

  const applyFilters = useCallback((complaintsToFilter, currentFilters) => {
    let filtered = [...complaintsToFilter];

    if (currentFilters.status && currentFilters.status !== "All") {
      filtered = filtered.filter(
        (c) => (c.status || c.Status || "").toString() === currentFilters.status
      );
    }

    if (currentFilters.priority && currentFilters.priority !== "all") {
      const target = currentFilters.priority.toLowerCase();
      filtered = filtered.filter((c) => {
        const p = (c.priority || c.Priority || "").toString().toLowerCase();
        if (target === "high") return p.includes("high") || p.includes("urgent");
        if (target === "medium") return p.includes("medium");
        if (target === "low") return p.includes("low");
        return true;
      });
    }

    if (currentFilters.search && currentFilters.search.trim() !== "") {
      const term = currentFilters.search.toLowerCase();
      filtered = filtered.filter((c) => {
        const title = (c.title || c.subject || "").toString().toLowerCase();
        const desc = (c.description || "").toString().toLowerCase();
        const cat = (c.category || c.department || "").toString().toLowerCase();
        const loc = (c.location || "").toString().toLowerCase();
        const name = (c.submittedBy || c.name || "").toString().toLowerCase();
        return (
          title.includes(term) ||
          desc.includes(term) ||
          cat.includes(term) ||
          loc.includes(term) ||
          name.includes(term)
        );
      });
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

        const response = await getAllComplaints();

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
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    const cleared = { status: "", search: "", dateRange: "all", priority: "" };
    setFilters(cleared);
    setFilterHighlight(false);
    applyFilters(complaints, cleared);
    success("🔄 Filters cleared!");
  }, [applyFilters, complaints, success]);

  const openComplaintDetails = useCallback(
    async (complaintId, editMode = false) => {
      try {
        if (!complaintId) {
          error("⚠️ Invalid complaint ID");
          return;
        }

        const complaintDetails = await getComplaintById(complaintId);

        setSelectedComplaint(complaintDetails);
        setIsEditMode(editMode);
        setIsModalOpen(true);

        logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
          page: "Complaints",
          complaintId,
          complaintTitle:
            complaintDetails?.title || complaintDetails?.subject || "Unknown",
          action: editMode ? "Editing complaint" : "Viewed complaint details",
        });
      } catch (err) {
        console.error("Error loading complaint:", err);
        error("⚠️ Failed to load complaint details.");
      }
    },
    [error]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const complaintId = urlParams.get("id");

    if (complaintId && complaints.length > 0 && openComplaintDetails) {
      const exists = complaints.find(
        (c) => c._id === complaintId || c.id === complaintId
      );

      if (exists) {
        openComplaintDetails(complaintId, false);
        window.history.replaceState({}, "", "/complaints");
      } else {
        error("⚠️ Complaint not found or access denied");
      }
    }
  }, [complaints, location.search, openComplaintDetails, error]);

  const handleRowClick = useCallback(
    (complaintId) => {
      openComplaintDetails(complaintId, false);
    },
    [openComplaintDetails]
  );

  const handleActionClick = useCallback(
    (action, complaint) => {
      if (!complaint?._id) return;

      if (action === "view") {
        openComplaintDetails(complaint._id, false);
      } else if (action === "edit") {
        openComplaintDetails(complaint._id, true);
      }
    },
    [openComplaintDetails]
  );

  const handleStatusUpdate = useCallback(
    async (complaintId, newStatus, remarks) => {
      try {
        const updateSuccess = await updateComplaintStatus(
          complaintId,
          newStatus,
          remarks
        );

        if (updateSuccess) {
          logActivity(ACTIVITY_TYPES.STATUS_CHANGE, {
            complaintId,
            complaintSubject:
              selectedComplaint?.title || selectedComplaint?.subject || "Unknown",
            previousStatus: selectedComplaint?.status || "Unknown",
            newStatus,
            remarks: remarks || "No remarks provided",
          });

          success(`✅ Complaint updated to ${newStatus}`);
          setIsModalOpen(false);
          setSelectedComplaint(null);
          setIsEditMode(false);

          const refreshed = await getAllComplaints();
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
    [selectedComplaint, filters, applyFilters, success, error]
  );

  const handleComplaintUpdate = useCallback(async () => {
    try {
      setIsModalOpen(false);
      setSelectedComplaint(null);
      setIsEditMode(false);

      const refreshed = await getAllComplaints();
      if (Array.isArray(refreshed)) {
        setComplaints(refreshed);
        applyFilters(refreshed, filters);
      }

      success("✅ Complaint updated successfully!");
    } catch (err) {
      console.error("Error refreshing complaints:", err);
      error("⚠️ Failed to refresh complaints list.");
    }
  }, [filters, applyFilters, success, error]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setIsEditMode(false);
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
    if (
      filters.status ||
      filters.dateRange !== "all" ||
      (filters.priority && filters.priority !== "")
    )
      return "filter";
    return "complaints";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Loading type="table" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-950">
      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <RiFileList3Line className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Manage Complaints
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {complaints.length} total complaints in the system
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <ComplaintFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          {/* Filter Banner */}
          {filterHighlight && filters.status && (
            <div
              className={`mb-4 border-l-4 p-3 rounded-r-lg ${
                filters.status === "Resolved"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : filters.status === "Pending"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : filters.status === "In Progress"
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">
                    {filters.status === "Resolved"
                      ? "✅"
                      : filters.status === "Pending"
                      ? "⏳"
                      : filters.status === "In Progress"
                      ? "🔧"
                      : "❌"}
                  </span>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    Showing {filteredComplaints.length} {filters.status} complaint
                    {filteredComplaints.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setFilterHighlight(false)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <RiCloseLine className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {filteredComplaints.length}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredComplaints.length === 1 ? "Complaint" : "Complaints"}
                  </span>
                  {(filters.status || filters.priority || filters.search || filters.dateRange !== "all") && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      (filtered)
                    </span>
                  )}
                </div>
                {filteredComplaints.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs transition-all shadow-sm"
                    >
                      <RiDownloadLine className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export</span>
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-xs transition-all shadow-sm"
                    >
                      <RiPrinterLine className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table Content */}
            {filteredComplaints.length === 0 ? (
              <div className="p-6 sm:p-8">
                <EmptyState
                  type={getEmptyStateType()}
                  searchTerm={filters.search}
                  onAction={handleClearFilters}
                  actionLabel="Clear All Filters"
                />
              </div>
            ) : (
              <ComplaintTable
                complaints={filteredComplaints}
                onRowClick={handleRowClick}
                onActionClick={handleActionClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedComplaint && isModalOpen && (
        <ComplaintDetails
          complaint={selectedComplaint}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          onComplaintUpdate={handleComplaintUpdate}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
};

export default Complaints;