// src/components/ComplaintTable.jsx

import React, { useState } from 'react';
import Badge from './Badge';
import ImageGallery from './ImageGallery';
import EmptyState from './EmptyState';
import { RiEyeLine, RiPlayFill, RiCheckFill, RiCloseFill, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

const ComplaintTable = ({ complaints, onRowClick, onActionClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedComplaints = React.useMemo(() => {
    let sortableComplaints = [...complaints];
    
    if (sortConfig.key !== null) {
      sortableComplaints.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'submittedAt' || sortConfig.key === 'updatedAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (sortConfig.key === 'priority') {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableComplaints;
  }, [complaints, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <RiArrowUpLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : 
      <RiArrowDownLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
  };

  const getActionButtons = (complaint) => {
    switch (complaint.status) {
      case 'Pending':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(complaint.id, 'start');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors"
              title="Start Work"
            >
              <RiPlayFill className="h-4 w-4" />
              <span className="hidden sm:inline">Start</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(complaint.id, 'reject');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
              title="Reject"
            >
              <RiCloseFill className="h-4 w-4" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          </>
        );
      case 'In Progress':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(complaint.id, 'resolve');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors"
              title="Mark Resolved"
            >
              <RiCheckFill className="h-4 w-4" />
              <span className="hidden sm:inline">Resolve</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(complaint.id, 'reject');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
              title="Reject"
            >
              <RiCloseFill className="h-4 w-4" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          </>
        );
      case 'Resolved':
      case 'Rejected':
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400 italic">No actions</span>
        );
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'Low':
        return 'text-green-600 dark:text-green-400 font-semibold';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (complaints.length === 0) {
    return <EmptyState type="filter" />;
  }

  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  ID
                  <SortIcon columnKey="id" />
                </div>
              </th>

              {/* IMAGE COLUMN */}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Image
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('subject')}
              >
                <div className="flex items-center gap-2">
                  Subject
                  <SortIcon columnKey="subject" />
                </div>
              </th>

              {/* ✅ NEW: SUBMITTED BY COLUMN */}
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('submittedBy')}
              >
                <div className="flex items-center gap-2">
                  Submitted By
                  <SortIcon columnKey="submittedBy" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-2">
                  Category
                  <SortIcon columnKey="category" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center gap-2">
                  Location
                  <SortIcon columnKey="location" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon columnKey="status" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  Priority
                  <SortIcon columnKey="priority" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => handleSort('submittedAt')}
              >
                <div className="flex items-center gap-2">
                  Date
                  <SortIcon columnKey="submittedAt" />
                </div>
              </th>
              
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedComplaints.map((complaint) => (
              <tr
                key={complaint.id}
                onClick={() => onRowClick(complaint.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    #{complaint.id}
                  </span>
                </td>

                {/* IMAGE CELL */}
                <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <ImageGallery images={complaint.images} compact={true} />
                </td>

                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-xs truncate">
                    {complaint.subject}
                  </div>
                </td>

                {/* ✅ NEW: SUBMITTED BY CELL */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {complaint.isAnonymous ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm italic text-gray-500 dark:text-gray-400">
                        Anonymous
                      </span>
                      <span 
                        className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-semibold"
                        title="This complaint was submitted anonymously"
                      >
                        🕵️
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {complaint.submittedBy}
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{complaint.category}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {complaint.location}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge status={complaint.status} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(complaint.submittedAt)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(complaint.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="View Details"
                    >
                      <RiEyeLine className="h-4 w-4" />
                      <span className="hidden lg:inline">View</span>
                    </button>
                    {getActionButtons(complaint)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-4">
        {sortedComplaints.map((complaint) => (
          <div
            key={complaint.id}
            onClick={() => onRowClick(complaint.id)}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                #{complaint.id}
              </span>
              <Badge status={complaint.status} />
            </div>

            {/* IMAGE GALLERY IN MOBILE CARD */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                <ImageGallery images={complaint.images} compact={true} />
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {complaint.subject}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              {/* ✅ NEW: SUBMITTED BY IN MOBILE */}
              <div className="col-span-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Submitted By:</span>
                {complaint.isAnonymous ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm italic text-gray-500 dark:text-gray-400">
                      Anonymous Student
                    </span>
                    <span className="text-xs">🕵️</span>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{complaint.submittedBy}</p>
                )}
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                <p className="text-gray-600 dark:text-gray-400">{complaint.category}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                <p className={getPriorityColor(complaint.priority)}>
                  {complaint.priority}
                </p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                <p className="text-gray-600 dark:text-gray-400">{complaint.location}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                <p className="text-gray-600 dark:text-gray-400">{formatDate(complaint.submittedAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(complaint.id);
                }}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RiEyeLine className="h-5 w-5" />
                <span>View</span>
              </button>
              {(complaint.status === 'Pending' || complaint.status === 'In Progress') && (
                <div className="flex gap-2 flex-1">
                  {getActionButtons(complaint)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ComplaintTable;