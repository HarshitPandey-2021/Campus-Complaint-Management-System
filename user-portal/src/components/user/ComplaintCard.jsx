// src/components/user/ComplaintCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import { RiMapPinLine, RiCalendarLine, RiArrowRightLine } from 'react-icons/ri';

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/user/complaints/${complaint.id}`)}
      className="group bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
        <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
          #{complaint.id}
        </span>
        <Badge status={complaint.status} />
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
        {complaint.subject}
      </h3>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span>
          <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate">
            {complaint.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Priority:</span>
          <span className={`px-2 py-1 rounded font-semibold truncate ${
            complaint.priority === 'High'
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : complaint.priority === 'Medium'
              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {complaint.priority}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <RiMapPinLine className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">Location:</span>
          <span className="text-gray-600 dark:text-gray-400 truncate">{complaint.location}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 sm:col-span-2">
          <RiCalendarLine className="h-3 w-3 flex-shrink-0" />
          <span className="font-semibold">Submitted:</span>
          <span className="truncate">
            {new Date(complaint.submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Admin Remarks (if any) */}
      {complaint.adminRemarks && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">
            Admin Remarks:
          </p>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic line-clamp-2">
            "{complaint.adminRemarks}"
          </p>
        </div>
      )}

      {/* View Details */}
      <div className="mt-4 flex justify-end">
        <span className="flex items-center gap-1 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold group-hover:gap-2 transition-all">
          View Details
          <RiArrowRightLine className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
};

export default ComplaintCard;