import React, { useState } from "react";
import Badge from "../Badge";
import EmptyState from "../EmptyState";
import SortIcon from "./SortIcon";
import PrimaryActionButton from "./PrimaryActionButton";
import ActionsDropdown from "./ActionsDropdown";

export default function ComplaintTable({
  complaints = [],
  onRowClick,
  onActionClick,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "submittedAt",
    direction: "desc",
  });

  // 👇 Single source of truth for open dropdown
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (!complaints.length) return <EmptyState type="filter" />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {[
              "id",
              "subject",
              "category",
              "location",
              "priority",
              "status",
              "submittedAt",
              "actions",
            ].map((col) => (
              <th
                key={col}
                onClick={() => col !== "actions" && handleSort(col)}
                className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="capitalize">
                    {col === "submittedAt" ? "Date" : col}
                  </span>
                  {col !== "actions" && (
                    <SortIcon sortConfig={sortConfig} columnKey={col} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {complaints.map((complaint) => (
            <tr key={complaint._id}>
              <td className="px-4 py-3">{complaint._id}</td>
              <td className="px-4 py-3">{complaint.subject}</td>
              <td className="px-4 py-3">{complaint.category}</td>
              <td className="px-4 py-3">{complaint.location}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    complaint.priority === "High"
                      ? "bg-red-100 text-red-700"
                      : complaint.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {complaint.priority}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge status={complaint.status} />
              </td>
              <td className="px-4 py-3">{formatDate(complaint.submittedAt)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <PrimaryActionButton
                    status={complaint.status}
                    onActionClick={(action) =>
                      onActionClick?.(complaint._id, action)
                    }
                  />
                  <ActionsDropdown
                    complaintId={complaint._id}
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                    onRowClick={onRowClick}
                    onActionClick={onActionClick}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

