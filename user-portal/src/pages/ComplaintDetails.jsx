// src/pages/ComplaintDetails.jsx - WITH LIGHTBOX + TIMELINE + EDIT

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getComplaintById } from '../services/userService';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import ImageLightbox from '../components/user/ImageLightbox';
import ComplaintTimeline from '../components/user/ComplaintTimeline';
import { 
  RiArrowLeftLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiFileTextLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiDownloadLine,
  RiEditLine,
  RiImageLine
} from 'react-icons/ri';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showTimeline, setShowTimeline] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const data = getComplaintById(id);
      setComplaint(data);
      setLoading(false);
    }, 500);
  }, [id]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const canEdit = () => {
    return complaint?.status === 'Pending' && !complaint?.assignedTo;
  };

  if (loading) {
    return <Loading />;
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center animate-scaleIn">
          <RiErrorWarningLine className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Complaint Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The complaint you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/user/complaints')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all hover:scale-105"
          >
            Back to My Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fadeIn">
          <button
            onClick={() => navigate('/user/complaints')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <RiArrowLeftLine className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-semibold">Back to My Complaints</span>
          </button>

          {canEdit() && (
            <button
              onClick={() => navigate(`/user/complaints/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all hover:scale-105"
            >
              <RiEditLine className="h-5 w-5" />
              Edit Complaint
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Complaint #{complaint.id}
                  </h1>
                  <Badge status={complaint.status} />
                </div>
                <h2 className="text-xl font-semibold text-white/90">
                  {complaint.subject}
                </h2>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">CATEGORY</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    {complaint.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">PRIORITY</p>
                  <span className={`inline-block px-4 py-2 rounded-lg font-bold text-base ${
                    complaint.priority === 'High'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : complaint.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {complaint.priority}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <RiMapPinLine className="h-4 w-4" />
                    LOCATION
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {complaint.location}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <RiCalendarLine className="h-4 w-4" />
                    SUBMITTED ON
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(complaint.submittedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <RiUserLine className="h-4 w-4" />
                    SUBMITTED BY
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {complaint.isAnonymous ? (
                      <span className="italic text-gray-500">Anonymous 🕵️</span>
                    ) : (
                      'You'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <RiFileTextLine className="h-4 w-4" />
                DESCRIPTION
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-scaleIn" style={{ animationDelay: '0.3s' }}>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <RiImageLine className="h-4 w-4" />
                  ATTACHED IMAGES ({complaint.images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => openLightbox(index)}
                      className="group relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden hover:ring-4 hover:ring-indigo-500 transition-all hover:scale-105"
                    >
                      <img src={img} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">Click to view</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PDF */}
            {complaint.verificationDocument && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-scaleIn" style={{ animationDelay: '0.4s' }}>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">VERIFICATION DOCUMENT</p>
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {complaint.verificationDocument.filename}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(complaint.verificationDocument.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <RiDownloadLine className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Admin Remarks */}
            {complaint.adminRemarks && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 animate-scaleIn" style={{ animationDelay: '0.5s' }}>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <RiCheckboxCircleLine className="h-4 w-4" />
                  ADMIN REMARKS
                </p>
                <p className="text-base text-blue-900 dark:text-blue-300 italic">
                  "{complaint.adminRemarks}"
                </p>
              </div>
            )}

            {/* Expected Resolution */}
            {complaint.expectedResolutionDate && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 animate-scaleIn" style={{ animationDelay: '0.6s' }}>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                  <RiTimeLine className="h-4 w-4" />
                  EXPECTED RESOLUTION
                </p>
                <p className="text-base text-yellow-900 dark:text-yellow-300">
                  {new Date(complaint.expectedResolutionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Assigned To */}
            {complaint.assignedTo && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-scaleIn" style={{ animationDelay: '0.7s' }}>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">ASSIGNED TO</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {complaint.assignedTo}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RiTimeLine className="h-5 w-5" />
                  Complaint Timeline
                </h3>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <ComplaintTimeline complaint={complaint} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={complaint.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ComplaintDetails;