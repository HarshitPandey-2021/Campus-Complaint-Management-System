// src/components/ComplaintTable.jsx

import React, { useState, useMemo } from "react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import ImageGallery from "./ImageGallery";
import ActionsDropdown from "./ActionsDropdown";
import SortIcon from "./SortIcon";
import {
  RiMapPinLine,
  RiCalendarLine,
  RiUserLine,
  RiPriceTag3Line,
} from "react-icons/ri";

const ComplaintTable = ({ complaints, onRowClick, onActionClick }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "submittedAt",
    direction: "desc",
  });

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d)) return "Invalid date";
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d)) return "Invalid date";
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const getDisplayDate = (c) =>
    c.createdAt || c.submittedAt || c.date || null;

  const sortedComplaints = useMemo(() => {
    const sortable = [...complaints];
    if (!sortConfig.key) return sortable;

    return sortable.sort((a, b) => {
      const dir = sortConfig.direction === "asc" ? 1 : -1;

      // Date sorting
      if (
        sortConfig.key === "submittedAt" ||
        sortConfig.key === "createdAt" ||
        sortConfig.key === "date"
      ) {
        const ad = new Date(getDisplayDate(a));
        const bd = new Date(getDisplayDate(b));
        const at = isNaN(ad) ? 0 : ad.getTime();
        const bt = isNaN(bd) ? 0 : bd.getTime();
        if (at < bt) return -1 * dir;
        if (at > bt) return 1 * dir;
        return 0;
      }

      // Priority sorting
      if (sortConfig.key === "priority") {
        const order = { High: 3, Medium: 2, Low: 1 };
        const av = order[a.priority] || 0;
        const bv = order[b.priority] || 0;
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      }

      // Generic
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * dir;
      }
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [complaints, sortConfig]);

  if (!sortedComplaints.length) {
    return (
      <EmptyState
        type="complaints"
        title="No complaints found"
        description="There are no complaints to display right now."
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/40">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              ID
            </th>

            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Image
            </th>

            <th
              onClick={() => handleSort("title")}
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
            >
              Subject{" "}
              <SortIcon sortConfig={sortConfig} columnKey="title" />
            </th>

            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Submitted By
            </th>

            <th
              onClick={() => handleSort("category")}
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
            >
              Category{" "}
              <SortIcon sortConfig={sortConfig} columnKey="category" />
            </th>

            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Location
            </th>

            <th
              onClick={() => handleSort("submittedAt")}
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
            >
              Submitted{" "}
              <SortIcon
                sortConfig={sortConfig}
                columnKey="submittedAt"
              />
            </th>

            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>

            <th
              onClick={() => handleSort("priority")}
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
            >
              Priority{" "}
              <SortIcon sortConfig={sortConfig} columnKey="priority" />
            </th>

            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedComplaints.map((complaint, index) => {
            const priorityConfig = {
              label: complaint.priority || "Medium",
              color:
                complaint.priority === "High"
                  ? "bg-red-100 text-red-800"
                  : complaint.priority === "Medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800",
            };

            const displayDate = getDisplayDate(complaint);

            return (
              <tr
                key={complaint._id || complaint.id || index}
                className="hover:bg-indigo-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => onRowClick(complaint._id || complaint.id)}
              >
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  #{index + 1}
                </td>

                <td className="px-4 py-3">
                  {complaint.images?.length > 0 ? (
                    <ImageGallery
                      images={complaint.images}
                      compact
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <div className="font-semibold truncate max-w-xs">
                    {complaint.title || complaint.subject}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <RiMapPinLine className="h-3 w-3" />
                    <span className="truncate">{complaint.location}</span>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-center gap-1">
                    <RiUserLine className="h-3 w-3 text-gray-400" />
                    <span className="truncate max-w-[140px]">
                      {complaint.isAnonymous
                        ? "Anonymous 🕵️"
                        : complaint.submittedBy}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {complaint.category}
                </td>

                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {formatDateShort(displayDate)}
                </td>

                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <RiCalendarLine className="h-3 w-3 text-gray-400" />
                    <span>{formatDate(displayDate)}</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <Badge status={complaint.status} />
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}
                  >
                    <RiPriceTag3Line className="mr-1 h-3 w-3" />
                    {priorityConfig.label}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <ActionsDropdown
                    complaintId={complaint._id || complaint.id}
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                    onRowClick={onRowClick}
                    onActionClick={onActionClick}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable;
