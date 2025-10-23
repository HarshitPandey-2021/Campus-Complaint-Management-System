// src/components/ComplaintDetails.jsx

import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiPlayFill, RiCheckFill, RiCloseFill, RiAlertLine } from 'react-icons/ri';
import Badge from './Badge';
import LoadingSpinner from './LoadingSpinner';

const ComplaintDetails = ({ complaint, isOpen, onClose, onStatusUpdate }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setActionType(null);
      setAdminRemarks('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (showConfirmation) {
          setShowConfirmation(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, showConfirmation, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !complaint) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActionClick = (action) => {
    setActionType(action);
    setShowConfirmation(true);
  };

  const handleConfirmAction = () => {
    if ((actionType === 'resolve' || actionType === 'reject') && !adminRemarks.trim()) {
      alert('Please provide admin remarks for this action.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newStatus = 
        actionType === 'start' ? 'In Progress' :
        actionType === 'resolve' ? 'Resolved' :
        'Rejected';

      onStatusUpdate(complaint.id, newStatus, adminRemarks);
      setIsSubmitting(false);
      setShowConfirmation(false);
      onClose();
    }, 800);
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setActionType(null);
    setAdminRemarks('');
  };

  const getActionButtons = () => {
    switch (complaint.status) {
      case 'Pending':
        return (
          <>
            <button
              onClick={() => handleActionClick('start')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <RiPlayFill className="h-5 w-5" />
              <span>Start Work</span>
            </button>
            <button
              onClick={() => handleActionClick('reject')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <RiCloseFill className="h-5 w-5" />
              <span>Reject</span>
            </button>
          </>
        );
      case 'In Progress':
        return (
          <>
            <button
              onClick={() => handleActionClick('resolve')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <RiCheckFill className="h-5 w-5" />
              <span>Mark Resolved</span>
            </button>
            <button
              onClick={() => handleActionClick('reject')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <RiCloseFill className="h-5 w-5" />
              <span>Reject</span>
            </button>
          </>
        );
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'Low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <>
      {/* Main Modal Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-70 animate-fadeIn"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Complaint Details</h2>
              <Badge status={complaint.status} />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <RiCloseLine className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* ID */}
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">#{complaint.id}</span>
            </div>

            {/* Subject */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{complaint.subject}</h3>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {complaint.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {complaint.category}
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <p className={`font-semibold px-4 py-2 rounded-lg border ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </p>
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {complaint.location}
                </p>
              </div>
            </div>

            {/* Submitted By Info */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Submitted By</h4>
              <div className="space-y-1">
                <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Name:</span> {complaint.submittedBy}</p>
                <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Email:</span> {complaint.email}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm"><span className="font-medium">Date:</span> {formatDate(complaint.submittedAt)}</p>
              </div>
            </div>

            {/* Admin Remarks (if exists) */}
            {complaint.adminRemarks && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Previous Admin Remarks
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  {complaint.adminRemarks}
                </p>
              </div>
            )}

            {/* Assigned To (if exists) */}
            {complaint.assignedTo && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assigned To
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {complaint.assignedTo}
                </p>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <span className="font-medium">Last Updated:</span> {formatDate(complaint.updatedAt)}
            </div>
          </div>

          {/* Modal Footer - Action Buttons */}
          {(complaint.status === 'Pending' || complaint.status === 'In Progress') && (
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                {getActionButtons()}
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Close button for resolved/rejected */}
          {(complaint.status === 'Resolved' || complaint.status === 'Rejected') && (
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-60 dark:bg-opacity-80 animate-fadeIn"
          onClick={handleCancelAction}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confirmation Header */}
            <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <RiAlertLine className="h-6 w-6 text-white" />
                <h3 className="text-xl font-bold text-white">Confirm Action</h3>
              </div>
            </div>

            {/* Confirmation Body */}
            <div className="p-6 space-y-4">
                           <p className="text-gray-800 dark:text-gray-200">
                {actionType === 'start' && 'Are you sure you want to start work on this complaint?'}
                {actionType === 'resolve' && 'Are you sure you want to mark this complaint as resolved?'}
                {actionType === 'reject' && 'Are you sure you want to reject this complaint?'}
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Complaint #{complaint.id}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{complaint.subject}</p>
              </div>

              {/* Admin Remarks Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Admin Remarks {(actionType === 'resolve' || actionType === 'reject') && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder={
                    actionType === 'start' ? 'Optional: Add notes about starting work...' :
                    actionType === 'resolve' ? 'Required: Explain how the issue was resolved...' :
                    'Required: Explain why this complaint is being rejected...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {adminRemarks.length} characters
                </p>
              </div>
            </div>

            {/* Confirmation Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-lg flex gap-3">
              <button
                onClick={handleCancelAction}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  actionType === 'start' ? 'bg-indigo-600 hover:bg-indigo-700' :
                  actionType === 'resolve' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComplaintDetails;