// src/pages/Complaints.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ComplaintFilters from '../components/ComplaintFilters';
import ComplaintTable from '../components/ComplaintTable';
import ComplaintDetails from '../components/ComplaintDetails';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getAllComplaints, filterComplaints, updateComplaintStatus, getComplaintById } from '../services/adminService';
import { RiDownloadLine, RiPrinterLine, RiArrowRightLine, RiCloseLine } from 'react-icons/ri';
import { exportToCSV, exportToPrint } from '../utils/exportUtils';
// import { RiDownloadLine, RiPrinterLine, RiArrowRightLine,  } from 'react-icons/ri';

const Complaints = () => {
  const location = useLocation();
  
  // ✅ FIX: Initialize filters from location.state IMMEDIATELY (not in useEffect)
  const initialFilters = useMemo(() => {
    if (location.state?.filterStatus) {
      const filterValue = location.state.filterStatus;
      const statusToFilter = filterValue === 'all' ? '' : filterValue;
      
      // Clear navigation state immediately
      window.history.replaceState({}, document.title);
      
      return {
        status: statusToFilter,
        search: '',
        dateRange: 'all'
      };
    }
    return { status: '', search: '', dateRange: 'all' };
  }, [location.state]);

  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState(initialFilters); // ✅ Use initialFilters
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterHighlight, setFilterHighlight] = useState(!!location.state?.filterStatus);
  
  const { toasts, removeToast, success, error } = useToast();

  // ✅ FIX: Load data and apply initial filter in ONE step
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const complaints = getAllComplaints();
      setAllComplaints(complaints);
      
      // Apply initial filter immediately (no flash of unfiltered data)
      const filtered = filterComplaints(currentFilters);
      setFilteredComplaints(filtered);
      
      setIsLoading(false);
      
      // Visual feedback animation
      if (filterHighlight) {
        setTimeout(() => setFilterHighlight(false), 4000);
      }
    }, 500);
  }, []); // Only run once on mount

  const handleFilterChange = (filters) => {
    setIsLoading(true);
    setCurrentFilters(filters);

    setTimeout(() => {
      const filtered = filterComplaints(filters);
      setFilteredComplaints(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handleClearFilters = () => {
    const defaultFilters = { status: '', search: '', dateRange: 'all' };
    setCurrentFilters(defaultFilters);
    setFilteredComplaints(allComplaints);
    success('🔄 Filters cleared!');
  };

  const handleRowClick = (complaintId) => {
    const complaint = getComplaintById(complaintId);
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleActionClick = (complaintId, action) => {
    const complaint = getComplaintById(complaintId);
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (complaintId, newStatus, remarks) => {
    const updateSuccess = updateComplaintStatus(complaintId, newStatus, remarks);
    
    if (updateSuccess) {
      success(`✅ Complaint #${complaintId} updated to ${newStatus}!`);
      
      // Refresh data
      const allUpdated = getAllComplaints();
      setAllComplaints(allUpdated);
      
      // Re-apply current filters
      const filtered = filterComplaints(currentFilters);
      setFilteredComplaints(filtered);
      
      setIsModalOpen(false);
      setSelectedComplaint(null);
    } else {
      error(`❌ Failed to update complaint #${complaintId}. Please try again.`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleExportCSV = () => {
    const filename = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filteredComplaints, filename);
    success(`✅ ${filteredComplaints.length} complaints exported to CSV!`);
  };

  const handlePrint = () => {
    exportToPrint(filteredComplaints);
    success('📄 Print preview opened in new tab');
  };

  const getEmptyStateType = () => {
    if (currentFilters.search) return 'search';
    if (currentFilters.status || currentFilters.dateRange !== 'all') return 'filter';
    return 'complaints';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-0 page-enter">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Manage Complaints
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Filter and manage all campus complaints from students and faculty.
        </p>
      </div>

      {/* Filters */}
      <ComplaintFilters 
        onFilterChange={handleFilterChange}
        initialFilters={currentFilters}
      />

      {/* Visual Feedback Banner */}
      {filterHighlight && currentFilters.status && (
  <div className={`mb-4 bg-gradient-to-r border-l-4 p-4 rounded-lg shadow-sm animate-slideDown relative ${
    currentFilters.status === 'Resolved' 
      ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-600'
      : currentFilters.status === 'Pending'
      ? 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-600'
      : currentFilters.status === 'In Progress'
      ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-600'
      : currentFilters.status === 'Rejected'
      ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-600'
      : 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-600'
  }`}>
    <div className="flex items-center gap-3">
      {/* Icon based on status */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
        currentFilters.status === 'Resolved'
          ? 'bg-green-600 animate-pulse'
          : currentFilters.status === 'Pending'
          ? 'bg-blue-600'
          : currentFilters.status === 'In Progress'
          ? 'bg-yellow-600'
          : currentFilters.status === 'Rejected'
          ? 'bg-red-600'
          : 'bg-indigo-600'
      }`}>
        {currentFilters.status === 'Resolved' ? (
          <span className="text-3xl">✅</span>
        ) : currentFilters.status === 'Pending' ? (
          <span className="text-3xl">⏳</span>
        ) : currentFilters.status === 'In Progress' ? (
          <span className="text-3xl">🔧</span>
        ) : currentFilters.status === 'Rejected' ? (
          <span className="text-3xl">❌</span>
        ) : (
          <RiArrowRightLine className="h-6 w-6 text-white" />
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span>Filtered from Dashboard</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            currentFilters.status === 'Resolved'
              ? 'bg-green-600 text-white'
              : currentFilters.status === 'Pending'
              ? 'bg-blue-600 text-white'
              : currentFilters.status === 'In Progress'
              ? 'bg-yellow-600 text-white'
              : currentFilters.status === 'Rejected'
              ? 'bg-red-600 text-white'
              : 'bg-indigo-600 text-white'
          }`}>
            {currentFilters.status}
          </span>
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Found <span className="font-bold text-lg">{filteredComplaints.length}</span> {filteredComplaints.length === 1 ? 'complaint' : 'complaints'}
        </p>
      </div>

      {/* ✅ NEW: Dismiss button */}
      <button
        onClick={() => setFilterHighlight(false)}
        className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Dismiss notification"
      >
        <RiCloseLine className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  </div>
)}

      {/* Results Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700 border-b-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: Count and Filter Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {isLoading ? (
                <span className="animate-pulse">Filtering...</span>
              ) : (
                <>
                  {filteredComplaints.length} 
                  <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                    {filteredComplaints.length === 1 ? 'Complaint' : 'Complaints'}
                  </span>
                </>
              )}
            </h2>
            
            {/* Active Filters Display */}
            <div className="flex items-center gap-2 flex-wrap">
              {currentFilters.status && (
                <span className={`text-xs text-gray-600 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 transition-all duration-300 ${
                  filterHighlight ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-800 scale-110 shadow-lg' : ''
                }`}>
                  Status: <span className="font-semibold">{currentFilters.status}</span>
                </span>
              )}
              {currentFilters.dateRange && currentFilters.dateRange !== 'all' && (
                <span className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
                  {currentFilters.dateRange === 'today' ? 'Today' : 
                   currentFilters.dateRange === 'week' ? 'Last 7 Days' : 
                   currentFilters.dateRange === 'month' ? 'Last 30 Days' : 
                   currentFilters.dateRange}
                </span>
              )}
              {currentFilters.search && (
                <span className="text-xs text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-700">
                  Search: <span className="font-semibold">"{currentFilters.search}"</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Right: Export Buttons */}
          {filteredComplaints.length > 0 && !isLoading && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all hover:scale-105 shadow-sm text-sm"
                title="Export filtered complaints to CSV"
              >
                <RiDownloadLine className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all hover:scale-105 shadow-sm text-sm"
                title="Print filtered complaints"
              >
                <RiPrinterLine className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <>
          <div className="hidden md:block">
            <Loading type="table" />
          </div>
          <div className="md:hidden">
            <Loading type="cards" />
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredComplaints.length === 0 && (
        <EmptyState 
          type={getEmptyStateType()}
          searchTerm={currentFilters.search}
          onAction={handleClearFilters}
          actionLabel="Clear All Filters"
        />
      )}

      {/* Complaint Table */}
      {!isLoading && filteredComplaints.length > 0 && (
        <ComplaintTable
          complaints={filteredComplaints}
          onRowClick={handleRowClick}
          onActionClick={handleActionClick}
        />
      )}

      {/* Complaint Details Modal */}
      <ComplaintDetails
        complaint={selectedComplaint}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default Complaints;