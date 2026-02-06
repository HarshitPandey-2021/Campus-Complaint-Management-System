// src/components/ComplaintTable.jsx - BEAUTIFUL & RESPONSIVE
import React, { useState, useMemo } from "react";
import {
  RiEyeLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiImageLine,
  RiTimeLine,
  RiMapPinLine,
  RiUser3Line,
  RiFolderLine,
} from "react-icons/ri";
import Badge from "./Badge";
import EmptyState from "./EmptyState";

const ComplaintTable = ({ complaints = [], onRowClick, onActionClick }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "submittedAt",
    direction: "desc",
  });

  // Sort handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Format date - full version
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format date - short version for mobile
  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // Format time ago
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
    return formatDateShort(dateString);
  };

  // Sorted complaints
  const sortedComplaints = useMemo(() => {
    const data = [...complaints];
    const { key, direction } = sortConfig;
    if (!key) return data;

    const dir = direction === "asc" ? 1 : -1;

    return data.sort((a, b) => {
      let aVal, bVal;

      switch (key) {
        case "subject":
          aVal = (a.subject || a.title || "").toLowerCase();
          bVal = (b.subject || b.title || "").toLowerCase();
          break;
        case "category":
          aVal = (a.category || a.department || "").toLowerCase();
          bVal = (b.category || b.department || "").toLowerCase();
          break;
        case "submittedAt":
          aVal = new Date(a.submittedAt || a.createdAt);
          bVal = new Date(b.submittedAt || b.createdAt);
          break;
        case "priority":
          const order = { High: 3, Medium: 2, Low: 1 };
          aVal = order[a.priority] || 0;
          bVal = order[b.priority] || 0;
          break;
        case "status":
          const statusOrder = { Pending: 1, "In Progress": 2, Resolved: 3, Rejected: 4 };
          aVal = statusOrder[a.status] || 0;
          bVal = statusOrder[b.status] || 0;
          break;
        default:
          aVal = a[key];
          bVal = b[key];
      }

      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [complaints, sortConfig]);

  // Handle view click
  const handleViewClick = (e, complaint) => {
    e.stopPropagation();
    const id = complaint._id || complaint.id;
    if (onActionClick) {
      onActionClick("view", complaint);
    } else if (onRowClick) {
      onRowClick(id);
    }
  };

  // Handle row click
  const handleRowClick = (complaint) => {
    const id = complaint._id || complaint.id;
    if (onRowClick) {
      onRowClick(id);
    }
  };

  // Sort Icon Component
  const SortIcon = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <span className={`inline-flex flex-col ml-1 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}>
        <RiArrowUpSLine 
          className={`h-3 w-3 -mb-1 ${isActive && sortConfig.direction === "asc" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"}`} 
        />
        <RiArrowDownSLine 
          className={`h-3 w-3 ${isActive && sortConfig.direction === "desc" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"}`} 
        />
      </span>
    );
  };

  // Priority Badge Component
  const PriorityBadge = ({ priority }) => {
    const config = {
      High: {
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
      },
      Medium: {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
      },
      Low: {
        bg: "bg-emerald-100 dark:bg-emerald-900/40",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
      },
    };

    const style = config[priority] || config.Low;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {priority || "Low"}
      </span>
    );
  };

  // Empty state
  if (!sortedComplaints.length) {
    return <EmptyState type="complaints" />;
  }

  // Table columns config
  const columns = [
    { key: "id", label: "#", sortable: false, className: "w-12" },
    { key: "subject", label: "Complaint", sortable: true, className: "min-w-[200px]" },
    { key: "category", label: "Category", sortable: true, className: "w-28" },
    { key: "submittedAt", label: "Date", sortable: true, className: "w-24" },
    { key: "status", label: "Status", sortable: true, className: "w-28" },
    { key: "priority", label: "Priority", sortable: true, className: "w-24" },
    { key: "actions", label: "", sortable: false, className: "w-20" },
  ];

  return (
    <div className="w-full">
      {/* ==================== DESKTOP TABLE ==================== */}
      <div className="hidden lg:block">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${col.className || ""} ${
                    col.sortable ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedComplaints.map((complaint, index) => {
              const id = complaint._id || complaint.id;
              const subject = complaint.subject || complaint.title || "Untitled";
              const submittedBy = complaint.isAnonymous
                ? "Anonymous"
                : complaint.submittedBy || complaint.name || "Unknown";
              const category = complaint.category || complaint.department || "General";
              const location = complaint.location || "";
              const dateValue = complaint.submittedAt || complaint.createdAt;
              const status = complaint.status || "Pending";
              const priority = complaint.priority || "Medium";
              const hasImage = complaint.images?.length > 0;

              return (
                <tr
                  key={id}
                  onClick={() => handleRowClick(complaint)}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  {/* Index */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                      {index + 1}
                    </span>
                  </td>

                  {/* Complaint Info */}
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {hasImage ? (
                          <img
                            src={complaint.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <RiImageLine className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {subject}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <RiUser3Line className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {submittedBy}
                            {complaint.isAnonymous && " 🕵️"}
                          </span>
                          {location && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <RiMapPinLine className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                      <RiFolderLine className="w-3 h-3" />
                      {category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(dateValue)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTimeAgo(dateValue)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <Badge status={status} />
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-4">
                    <PriorityBadge priority={priority} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => handleViewClick(e, complaint)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600"
                    >
                      <RiEyeLine className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ==================== TABLET VIEW ==================== */}
      <div className="hidden md:block lg:hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
              <th 
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("subject")}
              >
                <div className="flex items-center">Complaint<SortIcon columnKey="subject" /></div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">Status<SortIcon columnKey="status" /></div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">Priority<SortIcon columnKey="priority" /></div>
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedComplaints.map((complaint, index) => {
              const id = complaint._id || complaint.id;
              const subject = complaint.subject || complaint.title || "Untitled";
              const submittedBy = complaint.isAnonymous ? "Anonymous 🕵️" : complaint.submittedBy || "Unknown";
              const category = complaint.category || "General";
              const dateValue = complaint.submittedAt || complaint.createdAt;
              const status = complaint.status || "Pending";
              const priority = complaint.priority || "Medium";
              const hasImage = complaint.images?.length > 0;

              return (
                <tr
                  key={id}
                  onClick={() => handleRowClick(complaint)}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-3">
                    <span className="text-sm font-medium text-gray-400">{index + 1}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {hasImage ? (
                          <img src={complaint.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <RiImageLine className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {submittedBy} • {category} • {formatDateShort(dateValue)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge status={status} />
                  </td>
                  <td className="px-3 py-3">
                    <PriorityBadge priority={priority} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={(e) => handleViewClick(e, complaint)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <RiEyeLine className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ==================== MOBILE LIST VIEW ==================== */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {sortedComplaints.map((complaint, index) => {
          const id = complaint._id || complaint.id;
          const subject = complaint.subject || complaint.title || "Untitled";
          const submittedBy = complaint.isAnonymous ? "Anonymous 🕵️" : complaint.submittedBy || "Unknown";
          const category = complaint.category || "General";
          const dateValue = complaint.submittedAt || complaint.createdAt;
          const status = complaint.status || "Pending";
          const priority = complaint.priority || "Medium";
          const hasImage = complaint.images?.length > 0;

          return (
            <div
              key={id}
              onClick={() => handleRowClick(complaint)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer active:bg-gray-100 dark:active:bg-gray-800"
            >
              {/* Index + Image */}
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-sm">
                  {hasImage ? (
                    <img
                      src={complaint.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <RiImageLine className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                {/* Index badge */}
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gray-800 dark:bg-gray-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
                  {subject}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-[100px]">{submittedBy}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="truncate max-w-[60px]">{category}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex-shrink-0">{formatTimeAgo(dateValue)}</span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge status={status} />
                  <PriorityBadge priority={priority} />
                </div>
              </div>

              {/* View Button */}
              <button
                onClick={(e) => handleViewClick(e, complaint)}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <RiEyeLine className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintTable;