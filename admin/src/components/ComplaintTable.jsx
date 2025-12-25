// src/components/ComplaintTable/myComplaintTable.jsx
import React, { useState } from "react";
import Badge from "../Badge";
import {
  RiEyeLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiPriceTag3Line,
  RiCalendarLine,
} from "react-icons/ri";

const ComplaintTable = ({ complaints, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const sortedComplaints = React.useMemo(() => {
    let sortableComplaints = [...complaints];
    if (sortConfig.key !== null) {
      sortableComplaints.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (
          sortConfig.key === "createdAt" ||
          sortConfig.key === "submittedAt" ||
          sortConfig.key === "updatedAt"
        ) {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }

        if (sortConfig.key === "priority") {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableComplaints;
  }, [complaints, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <span className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          ↕
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <RiArrowUpLine className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" />
    ) : (
      <RiArrowDownLine className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" />
    );
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      High: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-300 dark:border-red-700",
        label: "High",
      },
      Medium: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        border: "border-yellow-300 dark:border-yellow-700",
        label: "Medium",
      },
      Low: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-300 dark:border-green-700",
        label: "Low",
      },
    };
    return configs[priority] || configs.Low;
  };

  if (complaints.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-b-lg p-12 text-center border border-gray-200 dark:border-gray-700 border-t-0">
        <p className="text-gray-600 dark:text-gray-400">No complaints found</p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-gray-200 dark:border-gray-700 border-t-0">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Title
                  <SortIcon columnKey="title" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Date
                  <SortIcon columnKey="createdAt" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon columnKey="status" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">
                  Priority
                  <SortIcon columnKey="priority" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedComplaints.map((complaint) => {
              const priorityConfig = getPriorityConfig(complaint.priority);
              const complaintId = complaint._id || complaint.id;

              console.log("🔍 Rendering row:", complaintId);

              return (
                <tr
                  key={complaintId}
                  className="hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer group"
                  onClick={(e) => {
                    if (!e.target.closest("button")) {
                      console.log("✅ Table row clicked:", complaintId);
                      onRowClick(complaintId);
                    }
                  }}
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {complaint.title || complaint.subject || "Untitled"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {complaint.category || "General"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(complaint.createdAt || complaint.submittedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge status={complaint.status || "Pending"} />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}
                    >
                      {priorityConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("👁️ View button clicked:", complaintId);
                        onRowClick(complaintId);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <RiEyeLine className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg">
        {sortedComplaints.map((complaint) => {
          const priorityConfig = getPriorityConfig(complaint.priority);
          const complaintId = complaint._id || complaint.id;

          return (
            <div
              key={complaintId}
              onClick={() => {
                console.log("📱 Mobile card clicked:", complaintId);
                onRowClick(complaintId);
              }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer overflow-hidden active:scale-98"
            >
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    #{complaintId?.toString().slice(-6) || "N/A"}
                  </span>
                  <Badge status={complaint.status} />
                </div>
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}
                >
                  {priorityConfig.label}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {complaint.title || complaint.subject || "Untitled"}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RiPriceTag3Line className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {complaint.category || "General"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RiCalendarLine className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {formatDate(complaint.createdAt || complaint.submittedAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("👁️ Mobile button clicked:", complaintId);
                    onRowClick(complaintId);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all active:scale-95"
                >
                  <RiEyeLine className="w-5 h-5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ComplaintTable;
