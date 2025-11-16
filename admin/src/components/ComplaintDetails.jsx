// src/components/ComplaintDetails.jsx

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // 🔥 ADD THIS
import { 
  RiCloseLine, 
  RiPlayFill, 
  RiCheckFill, 
  RiCloseFill, 
  RiAlertLine,
  RiFilePdfLine,
  RiDownloadLine
} from 'react-icons/ri';
import Badge from './Badge';
import LoadingSpinner from './LoadingSpinner';
import ImageGallery from './ImageGallery';
import ComplaintTimeline from './ComplaintTimeline';

const ComplaintDetails = ({ complaint, isOpen, onClose, onStatusUpdate }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setActionType(null);
      setAdminRemarks('');
    }
  }, [isOpen]);

  // 🔥 FIXED: Simplified body scroll lock (no layout shift)
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  // ESC key handler
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
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, showConfirmation, onClose]);

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

  // 🔥 CRITICAL FIX: Wrap entire return in Portal
  const modalContent = (
    <>
      {/* BACKDROP */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* MODAL CONTAINER */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* MODAL CONTENT */}
        <div 
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-modal-enter"
          onClick={(e) => e.stopPropagation()}
        >
          {/* STICKY HEADER */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                  Complaint Details
                </h2>
                <Badge status={complaint.status} />
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="Close modal"
              >
                <RiCloseLine className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div 
            id="modal-scroll-container"
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6"
          >
            
            {/* Anonymous Banner */}
            {complaint.isAnonymous && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 p-4 sm:p-5 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xl sm:text-2xl">🕵️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base sm:text-lg">
                      Anonymous Complaint
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      This complaint was submitted anonymously. The student's identity is protected for their safety. 
                      Please handle this matter with <strong>strict confidentiality</strong> and focus on resolving the issue promptly.
                    </p>
                    <div className="mt-3 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-yellow-300 dark:border-yellow-600">
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400 flex-shrink-0">⚠️</span>
                        <span>
                          <strong>Note:</strong> While contact details are hidden, the system can still send status updates 
                          to the student through our internal notification system.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ID */}
            <div className="flex items-center gap-4">
              <span className="text-base sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                #{complaint.id}
              </span>
            </div>

            {/* Subject */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 break-words">
                {complaint.subject}
              </h3>
            </div>

            {/* Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Attached Images ({complaint.images.length})
                </label>
                <ImageGallery images={complaint.images} />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap break-words">
                {complaint.description}
              </p>
            </div>

            {/* Verification Document */}
            {complaint.verificationDocument && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  📄 Application Letter / Verification Document
                </label>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 sm:p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center shadow-lg">
                      <RiFilePdfLine className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>

                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate mb-2">
                        {complaint.verificationDocument.filename}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <span>
                          <strong>Size:</strong> {formatFileSize(complaint.verificationDocument.size)}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="w-full sm:w-auto">
                          <strong>Uploaded:</strong> {new Date(complaint.verificationDocument.uploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`📄 Download: ${complaint.verificationDocument.filename}\n\nIn production, this would download the actual PDF file from the server.\n\nFile size: ${formatFileSize(complaint.verificationDocument.size)}`);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 shadow-md"
                      >
                        <RiDownloadLine className="h-4 w-4" />
                        <span className="whitespace-nowrap">Download Application Letter</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-red-300 dark:border-red-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 flex-shrink-0">⚠️</span>
                      <span>
                        <strong>Confidential Document:</strong> This application letter was submitted by the student 
                        for identity verification. Handle with strict confidentiality and do not share outside 
                        the complaint resolution process.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <ComplaintTimeline complaint={complaint} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {complaint.category}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <p className={`font-semibold px-4 py-2 rounded-lg border ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 break-words">
                  {complaint.location}
                </p>
              </div>
            </div>

            {/* Submitted By */}
            <div className={`p-4 rounded-lg border ${
              complaint.isAnonymous 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
            }`}>
              <h4 className={`text-sm font-semibold mb-3 ${
                complaint.isAnonymous
                  ? 'text-yellow-900 dark:text-yellow-300'
                  : 'text-indigo-900 dark:text-indigo-300'
              }`}>
                Submitted By
              </h4>
              
              {complaint.isAnonymous ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-800 dark:text-gray-200 flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Name:</span> 
                      <span className="italic text-gray-500 dark:text-gray-400">Anonymous Student</span>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        Protected Identity
                      </span>
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-yellow-300 dark:border-yellow-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="flex-shrink-0">🔒</span>
                      <span>
                        Contact information is hidden to protect the student's identity. 
                        The system can still send status updates through internal notifications.
                      </span>
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-medium">Submitted:</span> {formatDate(complaint.submittedAt)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-800 dark:text-gray-200 break-words">
                    <span className="font-medium">Name:</span> {complaint.submittedBy}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 break-words">
                    <span className="font-medium">Email:</span>{' '}
                    <a 
                      href={`mailto:${complaint.email}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                    >
                      {complaint.email}
                    </a>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-medium">Submitted:</span> {formatDate(complaint.submittedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Admin Remarks */}
            {complaint.adminRemarks && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Previous Admin Remarks
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 whitespace-pre-wrap break-words">
                  {complaint.adminRemarks}
                </p>
              </div>
            )}

            {/* Assigned To */}
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

          {/* STICKY FOOTER */}
          {(complaint.status === 'Pending' || complaint.status === 'In Progress') && (
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 rounded-b-2xl">
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

          {(complaint.status === 'Resolved' || complaint.status === 'Rejected') && (
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
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
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4" onClick={handleCancelAction}>
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <RiAlertLine className="h-6 w-6 text-white flex-shrink-0" />
                  <h3 className="text-xl font-bold text-white">Confirm Action</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-800 dark:text-gray-200">
                  {actionType === 'start' && 'Are you sure you want to start work on this complaint?'}
                  {actionType === 'resolve' && 'Are you sure you want to mark this complaint as resolved?'}
                  {actionType === 'reject' && 'Are you sure you want to reject this complaint?'}
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Complaint #{complaint.id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">{complaint.subject}</p>
                </div>

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

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row gap-3">
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
        </div>
      )}
    </>
  );

  // 🔥 CRITICAL FIX: Use Portal to render at document.body level
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default ComplaintDetails;