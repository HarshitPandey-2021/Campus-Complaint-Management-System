// src/components/ComplaintDetails.jsx - WITH EDIT MODE
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  RiCloseLine,
  RiPlayFill,
  RiCheckFill,
  RiCloseFill,
  RiAlertLine,
  RiFilePdfLine,
  RiDownloadLine,
  RiImageLine,
  RiEditLine,
  RiSaveLine,
} from "react-icons/ri";

import Badge from "./Badge";
import { updateComplaint } from "../api";
import { getAdminToken } from "../utils/tokenUtils";

const ComplaintDetails = ({ 
  complaint, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  onComplaintUpdate, // ✅ NEW: Callback after edit save
  isEditMode = false // ✅ NEW: Edit mode flag
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Edit mode states
  const [editMode, setEditMode] = useState(isEditMode);
  const [editedData, setEditedData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    location: "",
  });

  console.log("🔍 ComplaintDetails render:", {
    complaint: complaint?._id,
    isOpen,
    editMode,
    status: complaint?.status,
  });

  // Initialize edit data when complaint changes
  useEffect(() => {
    if (complaint) {
      setEditedData({
        title: complaint.title || complaint.subject || "",
        description: complaint.description || "",
        category: complaint.category || "",
        priority: complaint.priority || "Medium",
        location: complaint.location || "",
      });
      setEditMode(isEditMode);
    }
  }, [complaint, isEditMode]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setActionType(null);
      setAdminRemarks("");
      setSelectedImage(null);
      setEditMode(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        if (selectedImage) {
          setSelectedImage(null);
        } else if (showConfirmation) {
          setShowConfirmation(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, showConfirmation, selectedImage, onClose]);

  if (!isOpen || !complaint) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // ✅ Save edited complaint
  const handleSaveEdit = async () => {
    // Validation
    if (!editedData.title.trim()) {
      alert("Title is required!");
      return;
    }
    if (!editedData.description.trim()) {
      alert("Description is required!");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAdminToken() || localStorage.getItem("token");
      
      const updateData = {
        title: editedData.title,
        subject: editedData.title, // Keep both for compatibility
        description: editedData.description,
        category: editedData.category,
        priority: editedData.priority,
        location: editedData.location,
      };

      await updateComplaint(complaint._id, updateData, token);
      
      console.log("✅ Complaint updated successfully");
      
      setEditMode(false);
      
      // Notify parent to refresh list
      if (onComplaintUpdate) {
        onComplaintUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error("❌ Error updating complaint:", error);
      alert(`❌ Failed to update complaint: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    // Reset to original data
    setEditedData({
      title: complaint.title || complaint.subject || "",
      description: complaint.description || "",
      category: complaint.category || "",
      priority: complaint.priority || "Medium",
      location: complaint.location || "",
    });
    setEditMode(false);
  };

  // Handle status change actions
  const handleActionClick = (action) => {
    console.log("🎬 Action clicked:", action);
    setActionType(action);
    setShowConfirmation(true);
  };

  // Confirm status change
  const handleConfirmAction = () => {
    if (
      (actionType === "resolve" || actionType === "reject") &&
      !adminRemarks.trim()
    ) {
      alert("Please provide admin remarks for this action.");
      return;
    }

    console.log("✅ Confirming action:", actionType, "for complaint:", complaint._id);
    setIsSubmitting(true);

    setTimeout(() => {
      const newStatus =
        actionType === "start"
          ? "In Progress"
          : actionType === "resolve"
          ? "Resolved"
          : "Rejected";

      console.log("📤 Calling onStatusUpdate with:", {
        id: complaint._id,
        newStatus,
        remarks: adminRemarks,
      });

      onStatusUpdate(complaint._id, newStatus, adminRemarks);
      setIsSubmitting(false);
      setShowConfirmation(false);
      onClose();
    }, 800);
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setActionType(null);
    setAdminRemarks("");
  };

  const handlePdfView = () => {
    if (complaint.pdfDocument) {
      window.open(complaint.pdfDocument, "_blank");
    }
  };

  const handlePdfDownload = async () => {
    if (!complaint.pdfDocument) return;

    try {
      const response = await fetch(complaint.pdfDocument);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `complaint-${complaint._id}-document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF");
    }
  };

  const getActionButtons = () => {
    switch (complaint.status) {
      case "Pending":
        return (
          <>
            <button
              onClick={() => handleActionClick("start")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm active:scale-95"
            >
              <RiPlayFill className="h-5 w-5" />
              <span>Start Work</span>
            </button>
            <button
              onClick={() => handleActionClick("reject")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-all shadow-sm active:scale-95"
            >
              <RiCloseFill className="h-5 w-5" />
              <span>Reject</span>
            </button>
          </>
        );
      case "In Progress":
        return (
          <>
            <button
              onClick={() => handleActionClick("resolve")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 active:bg-green-800 transition-all shadow-sm active:scale-95"
            >
              <RiCheckFill className="h-5 w-5" />
              <span>Mark Resolved</span>
            </button>
            <button
              onClick={() => handleActionClick("reject")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-all shadow-sm active:scale-95"
            >
              <RiCloseFill className="h-5 w-5" />
              <span>Reject</span>
            </button>
          </>
        );
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "Low":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const modalContent = (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* MODAL CONTAINER */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-modal-enter"
          onClick={(e) => e.stopPropagation()}
        >
          {/* STICKY HEADER */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                  {editMode ? "Edit Complaint" : "Complaint Details"}
                </h2>
                <Badge status={complaint.status} />
              </div>
              <div className="flex items-center gap-2">
                {/* Edit Button - Only show if not in edit mode and status allows editing */}
                {!editMode && (complaint.status === "Pending" || complaint.status === "In Progress") && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RiEditLine className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  aria-label="Close modal"
                >
                  <RiCloseLine className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
                </button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
            {/* ID */}
            <div className="flex items-center gap-4">
              <span className="text-base sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                #{complaint._id?.toString().slice(-8) || complaint.complaintId || "N/A"}
              </span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title {editMode && <span className="text-red-600">*</span>}
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  placeholder="Enter complaint title"
                />
              ) : (
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 break-words">
                  {complaint.title || complaint.subject || "Untitled"}
                </h3>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description {editMode && <span className="text-red-600">*</span>}
              </label>
              {editMode ? (
                <textarea
                  value={editedData.description}
                  onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  placeholder="Enter complaint description"
                />
              ) : (
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap break-words">
                  {complaint.description || "No description provided"}
                </p>
              )}
            </div>

            {/* IMAGES SECTION */}
            {complaint.images && complaint.images.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Attached Images ({complaint.images.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all cursor-pointer group"
                    >
                      <img
                        src={imgUrl}
                        alt={`Complaint image ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <RiImageLine className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF SECTION */}
            {complaint.pdfDocument && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Application Letter / Verification Document
                </label>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 sm:p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center shadow-lg">
                      <RiFilePdfLine className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Application Document.pdf
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <strong>Note:</strong> Confidential document submitted by student
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={handlePdfView}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                          <RiFilePdfLine className="h-4 w-4" />
                          <span>View PDF</span>
                        </button>
                        <button
                          onClick={handlePdfDownload}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                          <RiDownloadLine className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                {editMode ? (
                  <select
                    value={editedData.category}
                    onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    <option value="">Select Category</option>
                    <option value="Academic">Academic</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Library">Library</option>
                    <option value="Transport">Transport</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {complaint.category || "General"}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                {editMode ? (
                  <select
                    value={editedData.priority}
                    onChange={(e) => setEditedData({ ...editedData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <p
                    className={`font-semibold px-4 py-2 rounded-lg border ${getPriorityColor(
                      complaint.priority
                    )}`}
                  >
                    {complaint.priority || "Medium"}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData.location}
                    onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    placeholder="Enter location"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 break-words">
                    {complaint.location || "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* Submitted By */}
            <div className="p-4 rounded-lg border bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <h4 className="text-sm font-semibold mb-3 text-indigo-900 dark:text-indigo-300">
                Submitted By
              </h4>
              <div className="space-y-2">
                <p className="text-gray-800 dark:text-gray-200 break-words">
                  <span className="font-medium">Name:</span>{" "}
                  {complaint.submittedBy || complaint.user?.name || "Anonymous"}
                </p>
                {complaint.email && (
                  <p className="text-gray-800 dark:text-gray-200 break-words">
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      href={`mailto:${complaint.email}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {complaint.email}
                    </a>
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  <span className="font-medium">Submitted:</span>{" "}
                  {formatDate(complaint.createdAt || complaint.submittedAt)}
                </p>
              </div>
            </div>

            {/* Admin Remarks */}
            {complaint.adminRemarks && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Previous Admin Remarks
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 whitespace-pre-wrap break-words">
                  {complaint.adminRemarks}
                </p>
              </div>
            )}

            {/* Assigned To */}
            {complaint.assignedTo && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assigned To
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {complaint.assignedTo}
                </p>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <span className="font-medium">Last Updated:</span>{" "}
              {formatDate(complaint.updatedAt)}
            </div>
          </div>

          {/* STICKY FOOTER */}
          {editMode ? (
            // Edit Mode Footer
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <RiSaveLine className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // View Mode Footer
            <>
              {(complaint.status === "Pending" || complaint.status === "In Progress") && (
                <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 rounded-b-2xl">
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    {getActionButtons()}
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {(complaint.status === "Resolved" || complaint.status === "Rejected") && (
                <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 rounded-b-2xl">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* IMAGE LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RiCloseLine className="h-8 w-8 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm">
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            onClick={handleCancelAction}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <RiAlertLine className="h-6 w-6 text-white flex-shrink-0" />
                  <h3 className="text-xl font-bold text-white">Confirm Action</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-800 dark:text-gray-200">
                  {actionType === "start"
                    ? "Are you sure you want to start work on this complaint?"
                    : actionType === "resolve"
                    ? "Are you sure you want to mark this complaint as resolved?"
                    : "Are you sure you want to reject this complaint?"}
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Complaint #{complaint._id?.toString().slice(-8) || complaint.complaintId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                    {complaint.title || complaint.subject}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Admin Remarks
                    {(actionType === "resolve" || actionType === "reject") && (
                      <span className="text-red-600"> *</span>
                    )}
                  </label>
                  <textarea
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder={
                      actionType === "start"
                        ? "Optional: Add notes about starting work..."
                        : actionType === "resolve"
                        ? "Required: Explain how the issue was resolved..."
                        : "Required: Explain why this complaint is being rejected..."
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {adminRemarks.length} characters
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancelAction}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    actionType === "start"
                      ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
                      : actionType === "resolve"
                      ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                      : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ComplaintDetails;


