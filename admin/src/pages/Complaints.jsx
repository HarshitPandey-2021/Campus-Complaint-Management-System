// src/pages/Complaints.jsx

import React, { useState, useEffect } from 'react';
import ComplaintFilters from '../components/ComplaintFilters';
import ComplaintTable from '../components/ComplaintTable';
import ComplaintDetails from '../components/ComplaintDetails';
import Loading from '../components/Loading';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getAllComplaints, filterComplaints, updateComplaintStatus, getComplaintById } from '../services/adminService';
import { RiDownloadLine, RiPrinterLine } from 'react-icons/ri';
import { exportToCSV, exportToPrint } from '../utils/exportUtils';

const Complaints = () => {
  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({ status: 'All', search: '', dateRange: 'All' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { toasts, removeToast, success, error, info } = useToast();

  useEffect(() => {
    const complaints = getAllComplaints();
    setAllComplaints(complaints);
    setFilteredComplaints(complaints);
  }, []);

  const handleFilterChange = (filters) => {
    setIsLoading(true);
    setCurrentFilters(filters);

    setTimeout(() => {
      const filtered = filterComplaints(filters);
      setFilteredComplaints(filtered);
      setIsLoading(false);
    }, 300);
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
    info('📄 Print preview opened in new tab');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Manage Complaints</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Filter and manage all campus complaints from students and faculty.
        </p>
      </div>

      {/* Filters */}
      <ComplaintFilters onFilterChange={handleFilterChange} />

      {/* Results Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700 border-b-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: Count and Filter Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {isLoading ? 'Filtering...' : `${filteredComplaints.length} Complaints`}
            </h2>
            {currentFilters.status !== 'All' && (
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700">
                Filtered by: <span className="font-semibold">{currentFilters.status}</span>
              </span>
            )}
          </div>
          
          {/* Right: Export Buttons */}
          {filteredComplaints.length > 0 && !isLoading && (
            <div className="flex items-center gap-2">
              {/* Export to CSV Button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-sm text-sm"
                title="Export filtered complaints to CSV"
              >
                <RiDownloadLine className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              
              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-sm text-sm"
                title="Print filtered complaints"
              >
                <RiPrinterLine className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Info text when filtering */}
        {!isLoading && filteredComplaints.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {currentFilters.search && `Showing results for "${currentFilters.search}"`}
            {currentFilters.dateRange !== 'All' && ` • ${currentFilters.dateRange}`}
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-b-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Loading />
        </div>
      )}

      {/* Complaint Table */}
      {!isLoading && (
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