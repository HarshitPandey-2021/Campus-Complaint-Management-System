// src/components/Badge.jsx - REFINED VERSION
import React from "react";

const Badge = ({ status, size = "default" }) => {
  const getStatusConfig = (status) => {
    const configs = {
      // Status badges
      Pending: {
        bg: "bg-blue-100 dark:bg-blue-900/40",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
        label: "Pending",
      },
      "In Progress": {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
        label: "In Progress",
      },
      Resolved: {
        bg: "bg-emerald-100 dark:bg-emerald-900/40",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
        label: "Resolved",
      },
      Rejected: {
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
        label: "Rejected",
      },
      // Priority badges (if used standalone)
      High: {
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
        label: "High",
      },
      Medium: {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
        label: "Medium",
      },
      Low: {
        bg: "bg-emerald-100 dark:bg-emerald-900/40",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
        label: "Low",
      },
    };

    return (
      configs[status] || {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        dot: "bg-gray-400",
        label: status || "Unknown",
      }
    );
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    small: "px-1.5 py-0.5 text-[10px]",
    default: "px-2 py-0.5 text-xs",
    large: "px-3 py-1 text-sm",
  };

  const dotSizes = {
    small: "w-1 h-1",
    default: "w-1.5 h-1.5",
    large: "w-2 h-2",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${config.bg} ${config.text} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      <span className={`rounded-full flex-shrink-0 ${config.dot} ${dotSizes[size]}`} />
      <span className="truncate">{config.label}</span>
    </span>
  );
};

export default Badge;