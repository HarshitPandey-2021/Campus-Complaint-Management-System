// src/components/ComplaintTable/ComplaintTable.jsx
import React, { useState, useMemo } from "react";
import Badge from "../Badge";
import EmptyState from "../EmptyState";
import SortIcon from "./SortIcon";
import ActionsDropdown from "./ActionsDropdown";
import { RiEyeLine } from "react-icons/ri";

export default function ComplaintTable({
  complaints = [],
  onRowClick,
  onActionClick,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "submittedAt",
    direction: "desc",
  });

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "Invalid";
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const sortedComplaints = useMemo(() => {
    const data = [...complaints];
    const { key, direction } = sortConfig;
    if (!key) return data;

    const dir = direction === "asc" ? 1 : -1;

    return data.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === "subject") {
        aVal = (a.subject || a.title || "").toString().toLowerCase();
        bVal = (b.subject || b.title || "").toString().toLowerCase();
      } else if (key === "category") {
        aVal = (a.category || a.department || "").toString().toLowerCase();
        bVal = (b.category || b.department || "").toString().toLowerCase();
      } else if (key === "submittedAt") {
        aVal = new Date(a.submittedAt || a.createdAt);
        bVal = new Date(b.submittedAt || b.createdAt);
      } else if (key === "priority") {
        const order = { High: 3, Medium: 2, Low: 1 };
        const pa = (a.priority || a.Priority || "").toString();
        const pb = (b.priority || b.Priority || "").toString();
        aVal = order[pa] || 0;
        bVal = order[pb] || 0;
      }

      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [complaints, sortConfig]);

  if (!sortedComplaints.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-gray-700">
        <EmptyState type="complaints" />
      </div>
    );
  }

  const columns = [
    { key: "id", label: "ID", sortable: false },
    { key: "subject", label: "Subject", sortable: true },
    { key: "submittedBy", label: "Submitted", sortable: false },
    { key: "category", label: "Category", sortable: true },
    { key: "location", label: "Location", sortable: false },
    { key: "submittedAt", label: "Date", sortable: true },
    { key: "status", label: "Status", sortable: false },
    { key: "priority", label: "Priority", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const getPriorityBadge = (priority) => {
    const p = (priority || "").toString().toLowerCase();
    if (p.includes("high") || p.includes("urgent")) {
      return <Badge status="High" />;
    }
    if (p.includes("medium")) {
      return <Badge status="Medium" />;
    }
    if (p.includes("low")) {
      return <Badge status="Low" />;
    }
    return <Badge status="Unknown" />;
  };

  const getStatusBadge = (status) => {
    return <Badge status={status} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300"
              >
                <div
                  className={`flex items-center gap-1 ${
                    col.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span>{col.label}</span>
                  {col.sortable && (
                    <SortIcon columnKey={col.key} sortConfig={sortConfig} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {sortedComplaints.map((complaint, index) => {
            const id = complaint._id || complaint.id || index + 1;
            const subject = complaint.subject || complaint.title || "Untitled";
            const submittedBy = complaint.isAnonymous
              ? "Anonymous 🕵️"
              : complaint.submittedBy || complaint.name || complaint.email;
            const category = complaint.category || complaint.department || "General";
            const location = complaint.location || "N/A";
            const dateValue = complaint.submittedAt || complaint.createdAt;
            const status = complaint.status || complaint.Status;
            const priority = complaint.priority || complaint.Priority;

            return (
              <tr
                key={id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors cursor-pointer"
                onClick={() => onRowClick && onRowClick(id)}
              >
                {/* ID */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  #{index + 1}
                </td>

                {/* Subject */}
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2">
                      {subject}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {complaint.complaintId || ""}
                    </span>
                  </div>
                </td>

                {/* Submitted by */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {submittedBy}
                </td>

                {/* Category */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {category}
                </td>

                {/* Location */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {location}
                </td>

                {/* Date */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {formatDate(dateValue)}
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(status)}</td>

                {/* Priority */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {getPriorityBadge(priority)}
                </td>

                {/* Actions */}
                <td
                  className="px-4 py-3 whitespace-nowrap text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => {
                        console.log("👁️ View clicked for:", id);
                        onActionClick && onActionClick("view", complaint);
                      }}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RiEyeLine size={14} />
                      View
                    </button>

                    {/* 3-dot Dropdown */}
                    <ActionsDropdown
                      complaintId={id}
                      openDropdownId={openDropdownId}
                      setOpenDropdownId={setOpenDropdownId}
                      onRowClick={(cId) => {
                        console.log("👁️ View Details clicked for:", cId);
                        onActionClick && onActionClick("view", complaint);
                      }}
                      onActionClick={(cId, action) => {
                        console.log(`🔧 ${action} clicked for:`, cId);
                        onActionClick && onActionClick(action, complaint);
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
