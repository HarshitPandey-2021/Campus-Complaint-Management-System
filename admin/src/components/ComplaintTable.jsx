// src/components/ComplaintTable.jsx

import React, { useState, useRef, useEffect } from 'react';
import Badge from './Badge';
import ImageGallery from './ImageGallery';
import EmptyState from './EmptyState';
import { 
  RiEyeLine, 
  RiPlayFill, 
  RiCheckFill, 
  RiCloseFill, 
  RiArrowUpLine, 
  RiArrowDownLine,
  RiMoreLine,
  RiMapPinLine,
  RiCalendarLine,
  RiUserLine,
  RiPriceTag3Line,
  RiEditLine
} from 'react-icons/ri';

const ComplaintTable = ({ complaints, onRowClick, onActionClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
      return (
        <span className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          ⇅
        </span>
      );
    }
    return sortConfig.direction === 'asc' ? 
      <RiArrowUpLine className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" /> : 
      <RiArrowDownLine className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" />;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      High: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
        label: 'High'
      },
      Medium: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
        label: 'Medium'
      },
      Low: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
        label: 'Low'
      }
    };
    return configs[priority] || configs.Low;
  };

  // PRIMARY ACTION BUTTON
  const PrimaryActionButton = ({ complaint }) => {
    let action = null;

    if (complaint.status === 'Pending') {
      action = {
        label: 'Start',
        icon: RiPlayFill,
        onClick: () => onActionClick(complaint.id, 'start'),
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
      };
    } else if (complaint.status === 'In Progress') {
      action = {
        label: 'Resolve',
        icon: RiCheckFill,
        onClick: () => onActionClick(complaint.id, 'resolve'),
        className: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
      };
    }

    if (!action) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          action.onClick();
        }}
        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${action.className}`}
        style={{ minWidth: '100px', height: '36px' }}
        aria-label={action.label}
      >
        <action.icon className="w-4 h-4" aria-hidden="true" />
        <span>{action.label}</span>
      </button>
    );
  };

  // ACTIONS DROPDOWN MENU
  const ActionsDropdown = ({ complaint }) => {
    const isOpen = openDropdownId === complaint.id;

    const actions = [
      {
        label: 'View Details',
        icon: RiEyeLine,
        onClick: () => {
          onRowClick(complaint.id);
          setOpenDropdownId(null);
        },
        className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        show: true
      },
      {
        label: 'Edit',
        icon: RiEditLine,
        onClick: () => {
          // Handle edit action
          setOpenDropdownId(null);
        },
        className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        show: complaint.status === 'Pending' || complaint.status === 'In Progress'
      },
      {
        label: 'Reject',
        icon: RiCloseFill,
        onClick: () => {
          onActionClick(complaint.id, 'reject');
          setOpenDropdownId(null);
        },
        className: 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
        show: complaint.status === 'Pending' || complaint.status === 'In Progress',
        divider: true
      }
    ];

    return (
      <div className="relative" ref={isOpen ? dropdownRef : null}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdownId(isOpen ? null : complaint.id);
          }}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="More actions"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <RiMoreLine className="w-5 h-5" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 animate-slideIn">
            {actions.map((action, index) => {
              if (!action.show) return null;
              
              return (
                <React.Fragment key={index}>
                  {action.divider && <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${action.className}`}
                    role="menuitem"
                  >
                    <action.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span>{action.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (complaints.length === 0) {
    return <EmptyState type="filter" />;
  }

  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {/* ID COLUMN - 60-80px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none"
                  onClick={() => handleSort('id')}
                  style={{ width: '70px', minWidth: '60px', maxWidth: '80px' }}
                >
                  <div className="flex items-center">
                    ID
                    <SortIcon columnKey="id" />
                  </div>
                </th>

                {/* IMAGE COLUMN - 60px */}
                <th 
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}
                >
                  Image
                </th>

                {/* SUBJECT COLUMN - min 200px, max 350px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none"
                  onClick={() => handleSort('subject')}
                  style={{ minWidth: '200px', maxWidth: '350px', width: '300px' }}
                >
                  <div className="flex items-center">
                    Subject
                    <SortIcon columnKey="subject" />
                  </div>
                </th>

                {/* VISUAL DIVIDER - GROUP SEPARATOR */}
                <th className="w-px bg-gray-200 dark:bg-gray-700" style={{ width: '1px', padding: 0 }}></th>

                {/* SUBMITTED BY COLUMN - 150px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none"
                  onClick={() => handleSort('submittedBy')}
                  style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}
                >
                  <div className="flex items-center">
                    Submitted
                    <SortIcon columnKey="submittedBy" />
                  </div>
                </th>

                {/* CATEGORY COLUMN - 120px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none hidden lg:table-cell"
                  onClick={() => handleSort('category')}
                  style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}
                >
                  <div className="flex items-center">
                    Category
                    <SortIcon columnKey="category" />
                  </div>
                </th>

                {/* LOCATION COLUMN - 120px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none hidden lg:table-cell"
                  onClick={() => handleSort('location')}
                  style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}
                >
                  <div className="flex items-center">
                    Location
                    <SortIcon columnKey="location" />
                  </div>
                </th>

                {/* DATE COLUMN - 120px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none"
                  onClick={() => handleSort('submittedAt')}
                  style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}
                >
                  <div className="flex items-center">
                    Date
                    <SortIcon columnKey="submittedAt" />
                  </div>
                </th>

                {/* VISUAL DIVIDER - GROUP SEPARATOR */}
                <th className="w-px bg-gray-200 dark:bg-gray-700" style={{ width: '1px', padding: 0 }}></th>

                {/* STATUS COLUMN - 120px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none"
                  onClick={() => handleSort('status')}
                  style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon columnKey="status" />
                  </div>
                </th>

                {/* PRIORITY COLUMN - 100px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none"
                  onClick={() => handleSort('priority')}
                  style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                >
                  <div className="flex items-center">
                    Priority
                    <SortIcon columnKey="priority" />
                  </div>
                </th>

                {/* ACTIONS COLUMN - 160-180px */}
                <th 
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  style={{ width: '170px', minWidth: '160px', maxWidth: '180px' }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedComplaints.map((complaint) => {
                const priorityConfig = getPriorityConfig(complaint.priority);

                return (
                  <tr
                    key={complaint.id}
                    onClick={() => onRowClick(complaint.id)}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    style={{ height: '60px' }}
                  >
                    {/* ID */}
                    <td className="px-4 py-3 align-middle" style={{ width: '70px' }}>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        #{complaint.id}
                      </span>
                    </td>

                    {/* IMAGE */}
                    <td className="px-3 py-3 align-middle" onClick={(e) => e.stopPropagation()} style={{ width: '60px' }}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {complaint.images && complaint.images.length > 0 ? (
                          <img 
                            src={complaint.images[0]} 
                            alt={`Complaint ${complaint.id}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <RiPriceTag3Line className="w-5 h-5 text-gray-400" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* SUBJECT - WITH TRUNCATION */}
                    <td className="px-4 py-3 align-middle" style={{ minWidth: '200px', maxWidth: '350px' }}>
                      <div 
                        className="text-sm font-semibold text-gray-800 dark:text-gray-200"
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={complaint.subject}
                      >
                        {complaint.subject}
                      </div>
                    </td>

                    {/* DIVIDER */}
                    <td className="bg-gray-100 dark:bg-gray-700" style={{ width: '1px', padding: 0 }}></td>

                    {/* SUBMITTED BY */}
                    <td className="px-4 py-3 align-middle" style={{ width: '150px' }}>
                      {complaint.isAnonymous ? (
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-sm italic text-gray-500 dark:text-gray-400"
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            Anonymous
                          </span>
                          <span className="text-xs flex-shrink-0" aria-label="Anonymous user">🕵️</span>
                        </div>
                      ) : (
                        <div 
                          className="text-sm text-gray-700 dark:text-gray-300"
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={complaint.submittedBy}
                        >
                          {complaint.submittedBy}
                        </div>
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3 align-middle hidden lg:table-cell" style={{ width: '120px' }}>
                      <span 
                        className="text-sm text-gray-700 dark:text-gray-300"
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block'
                        }}
                        title={complaint.category}
                      >
                        {complaint.category}
                      </span>
                    </td>

                    {/* LOCATION */}
                    <td className="px-4 py-3 align-middle hidden lg:table-cell" style={{ width: '120px' }}>
                      <div 
                        className="text-sm text-gray-600 dark:text-gray-400"
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={complaint.location}
                      >
                        {complaint.location}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3 align-middle" style={{ width: '120px' }}>
                      <span 
                        className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
                        title={formatDate(complaint.submittedAt)}
                      >
                        {formatDateShort(complaint.submittedAt)}
                      </span>
                    </td>

                    {/* DIVIDER */}
                    <td className="bg-gray-100 dark:bg-gray-700" style={{ width: '1px', padding: 0 }}></td>

                    {/* STATUS - STANDARDIZED BADGE */}
                    <td className="px-4 py-3 align-middle" style={{ width: '120px' }}>
                      <Badge status={complaint.status} />
                    </td>

                    {/* PRIORITY - STANDARDIZED BADGE */}
                    <td className="px-4 py-3 align-middle" style={{ width: '100px' }}>
                      <span 
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}
                        style={{ minWidth: '70px', height: '28px' }}
                      >
                        {priorityConfig.label}
                      </span>
                    </td>

                    {/* ACTIONS - FIXED WIDTH WITH FLEX */}
                    <td className="px-4 py-3 align-middle" style={{ width: '170px' }}>
                      <div 
                        className="flex items-center justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PrimaryActionButton complaint={complaint} />
                        <ActionsDropdown complaint={complaint} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLET/MOBILE CARD VIEW */}
      <div className="md:hidden space-y-4">
        {sortedComplaints.map((complaint) => {
          const priorityConfig = getPriorityConfig(complaint.priority);

          return (
            <div
              key={complaint.id}
              onClick={() => onRowClick(complaint.id)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              {/* CARD HEADER */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    #{complaint.id}
                  </span>
                  <Badge status={complaint.status} />
                </div>
                <span 
                  className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}
                  style={{ minWidth: '70px' }}
                >
                  {priorityConfig.label}
                </span>
              </div>

              {/* IMAGE */}
              {complaint.images && complaint.images.length > 0 && (
                <div className="p-4 pb-0">
                  <img 
                    src={complaint.images[0]} 
                    alt={`Complaint ${complaint.id}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* CONTENT */}
              <div className="p-4 space-y-3">
                {/* SUBJECT */}
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {complaint.subject}
                </h3>

                {/* DETAILS */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RiUserLine className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {complaint.isAnonymous ? (
                      <span className="italic">Anonymous 🕵️</span>
                    ) : (
                      <span className="truncate">{complaint.submittedBy}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RiPriceTag3Line className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{complaint.category}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RiMapPinLine className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{complaint.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RiCalendarLine className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span>{formatDate(complaint.submittedAt)}</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS - ICON ONLY ON MOBILE */}
              <div className="p-4 pt-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
                {(complaint.status === 'Pending' || complaint.status === 'In Progress') ? (
                  <>
                    <PrimaryActionButton complaint={complaint} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(complaint.id);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      style={{ height: '36px' }}
                      aria-label="View details"
                    >
                      <RiEyeLine className="w-5 h-5" aria-hidden="true" />
                      <span className="text-sm font-semibold">View</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(complaint.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    style={{ height: '36px' }}
                  >
                    <RiEyeLine className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-semibold">View Details</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ANIMATIONS & CUSTOM STYLES */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.15s ease-out;
        }

        @media (prefers-color-scheme: dark) {
          .dark\:bg-gray-750 {
            background-color: #1f2937;
          }
        }

        /* Ensure table doesn't overflow on smaller screens */
        @media (max-width: 1024px) {
          table {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  );
};

export default ComplaintTable;