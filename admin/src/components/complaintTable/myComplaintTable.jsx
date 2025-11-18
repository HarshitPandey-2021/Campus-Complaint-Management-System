// src/components/ComplaintTable.jsx

import React, { useState, useRef, useEffect } from 'react';
import Badge from '../Badge';
import ImageGallery from '../ImageGallery';
import EmptyState from '../EmptyState';
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

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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
    return sortConfig.direction === 'asc'
      ? <RiArrowUpLine className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" />
      : <RiArrowDownLine className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" />;
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
    const id = complaint._id?.$oid || complaint._id || complaint.id;
    let action = null;

    if (complaint.status === 'Pending') {
      action = {
        label: 'Start',
        icon: RiPlayFill,
        onClick: () => onActionClick(id, 'start'),
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
      };
    } else if (complaint.status === 'In Progress') {
      action = {
        label: 'Resolve',
        icon: RiCheckFill,
        onClick: () => onActionClick(id, 'resolve'),
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
    const id = complaint._id?.$oid || complaint._id || complaint.id;
    const isOpen = openDropdownId === id;

    const actions = [
      {
        label: 'View Details',
        icon: RiEyeLine,
        onClick: () => {
          onRowClick(id);
          setOpenDropdownId(null);
        },
        className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        show: true
      },
      {
        label: 'Edit',
        icon: RiEditLine,
        onClick: () => {
          setOpenDropdownId(null);
        },
        className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        show: complaint.status === 'Pending' || complaint.status === 'In Progress'
      },
      {
        label: 'Reject',
        icon: RiCloseFill,
        onClick: () => {
          onActionClick(id, 'reject');
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
            setOpenDropdownId(isOpen ? null : id);
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
    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID</th>
    <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Image</th>
    <th
      onClick={() => handleSort('subject')}
      className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
    >
      Subject <SortIcon columnKey="subject" />
    </th>
    <th
      onClick={() => handleSort('submittedAt')}
      className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
    >
      Submitted <SortIcon columnKey="submittedAt" />
    </th>
    <th
      onClick={() => handleSort('category')}
      className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
    >
      Category <SortIcon columnKey="category" />
    </th>
    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Location</th>
    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
    <th
      onClick={() => handleSort('priority')}
      className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
    >
      Priority <SortIcon columnKey="priority" />
    </th>
    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
  </tr>
</thead>


            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedComplaints.map((complaint, index) => {
                const id = complaint._id?.$oid || complaint._id || complaint.id;
                const priorityConfig = getPriorityConfig(complaint.priority);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick(id)}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400">#{index + 1}</td>

                    <td className="px-3 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {complaint.images?.length > 0 ? (
                          <img src={complaint.images[0]} alt={`Complaint ${id}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <RiPriceTag3Line className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{complaint.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {complaint.isAnonymous ? 'Anonymous 🕵️' : complaint.submittedBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 truncate">{complaint.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate">{complaint.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDateShort(complaint.submittedAt)}</td>
                    <td className="px-4 py-3"><Badge status={complaint.status} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>{priorityConfig.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
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

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {sortedComplaints.map((complaint) => {
          const id = complaint._id?.$oid || complaint._id || complaint.id;
          const priorityConfig = getPriorityConfig(complaint.priority);

          return (
            <div
              key={id}
              onClick={() => onRowClick(id)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">#{id}</span>
                  <Badge status={complaint.status} />
                </div>
                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>{priorityConfig.label}</span>
              </div>

              {complaint.images?.length > 0 && (
                <div className="p-4 pb-0">
                  <img src={complaint.images[0]} alt={`Complaint ${id}`} className="w-full h-48 object-cover rounded-lg" />
                </div>
              )}

              <div className="p-4 space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{complaint.subject}</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2"><RiUserLine className="w-4 h-4" />{complaint.isAnonymous ? 'Anonymous 🕵️' : complaint.submittedBy}</div>
                  <div className="flex items-center gap-2"><RiPriceTag3Line className="w-4 h-4" />{complaint.category}</div>
                  <div className="flex items-center gap-2"><RiMapPinLine className="w-4 h-4" />{complaint.location}</div>
                  <div className="flex items-center gap-2"><RiCalendarLine className="w-4 h-4" />{formatDate(complaint.submittedAt)}</div>
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
                {(complaint.status === 'Pending' || complaint.status === 'In Progress') ? (
                  <>
                    <PrimaryActionButton complaint={complaint} />
                    <button
                      onClick={() => onRowClick(id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <RiEyeLine className="w-5 h-5" />
                      <span className="text-sm font-semibold">View</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onRowClick(id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RiEyeLine className="w-5 h-5" />
                    <span className="text-sm font-semibold">View Details</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ComplaintTable;
