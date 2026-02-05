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

      if (sortConfig.key === "priority") {
        const order = { High: 3, Medium: 2, Low: 1 };
        const av = order[a.priority] || 0;
        const bv = order[b.priority] || 0;
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      }

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
    <>
      {/* Desktop Table - Scrolls only within container */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Image
              </th>
              <th
                onClick={() => handleSort("title")}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Subject <SortIcon sortConfig={sortConfig} columnKey="title" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted By
              </th>
              <th
                onClick={() => handleSort("category")}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Category <SortIcon sortConfig={sortConfig} columnKey="category" />
              </th>
              <th
                onClick={() => handleSort("submittedAt")}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Submitted <SortIcon sortConfig={sortConfig} columnKey="submittedAt" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th
                onClick={() => handleSort("priority")}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Priority <SortIcon sortConfig={sortConfig} columnKey="priority" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedComplaints.map((complaint, index) => {
              const priorityConfig = {
                label: complaint.priority || "Medium",
                color:
                  complaint.priority === "High"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : complaint.priority === "Medium"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
              };

              const displayDate = getDisplayDate(complaint);

              return (
                <tr
                  key={complaint._id || complaint.id || index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
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
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[200px]">
                      {complaint.title || complaint.subject}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <RiMapPinLine className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{complaint.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <RiUserLine className="h-3 w-3 text-gray-400" />
                      <span className="truncate max-w-[120px]">
                        {complaint.isAnonymous ? "Anonymous 🕵️" : complaint.submittedBy}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {complaint.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <RiCalendarLine className="h-3 w-3" />
                      <span>{formatDateShort(displayDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={complaint.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${priorityConfig.color}`}>
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

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {sortedComplaints.map((complaint, index) => {
          const priorityConfig = {
            label: complaint.priority || "Medium",
            color:
              complaint.priority === "High"
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                : complaint.priority === "Medium"
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
          };

          const displayDate = getDisplayDate(complaint);

          return (
            <div
              key={complaint._id || complaint.id || index}
              onClick={() => onRowClick(complaint._id || complaint.id)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                    <Badge status={complaint.status} />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {complaint.title || complaint.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <RiMapPinLine className="h-3 w-3" />
                      <span className="truncate max-w-[100px]">{complaint.location}</span>
                    </span>
                    <span>•</span>
                    <span>{formatDateShort(displayDate)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {complaint.category}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${priorityConfig.color}`}>
                      {priorityConfig.label}
                    </span>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionsDropdown
                    complaintId={complaint._id || complaint.id}
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                    onRowClick={onRowClick}
                    onActionClick={onActionClick}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ComplaintTable;