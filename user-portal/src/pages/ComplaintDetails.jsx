// src/pages/ComplaintDetails.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getComplaintById } from '../api'
import Loading from '../components/common/Loading'
import ImageLightbox from '../components/user/ImageLightbox'
import ComplaintTimeline from '../components/user/ComplaintTimeline'
import {
  RiArrowLeftLine, RiDownloadLine, RiEditLine, RiErrorWarningLine,
  RiMapPinLine, RiTimeLine, RiFlagLine, RiUserLine, RiCalendarLine,
  RiCheckboxCircleLine, RiFileTextLine
} from 'react-icons/ri'

const ComplaintDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [complaint, setComplaint] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true)
      const token = localStorage.getItem('token')
      const data = await getComplaintById(id, token)
      setComplaint(data)
      setLoading(false)
    }
    fetchComplaint()
  }, [id])

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const canEdit = complaint?.status === 'Pending' && !complaint?.assignedTo

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-green-600 dark:text-green-400',
      'Medium': 'text-yellow-600 dark:text-yellow-400',
      'High': 'text-red-600 dark:text-red-400'
    }
    return colors[priority] || 'text-gray-600'
  }

  if (loading) return <Loading />

  if (!complaint || !complaint._id) {
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
    )
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
          {canEdit && (
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {complaint.subject}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                {complaint.complaintId && (
                  <p className="text-indigo-200 text-sm mt-1">
                    ID: {complaint.complaintId}
                  </p>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <RiMapPinLine className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{complaint.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <RiFileTextLine className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{complaint.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <RiFlagLine className={`h-5 w-5 ${getPriorityColor(complaint.priority)}`} />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Priority</p>
                      <p className={`font-semibold ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <RiCalendarLine className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {complaint.submittedAt ? new Date(complaint.submittedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submitted By */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <RiUserLine className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Submitted By</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {complaint.isAnonymous ? 'Anonymous' : complaint.submittedBy}
                    </p>
                  </div>
                </div>

                {/* Assigned To */}
                {complaint.assignedTo && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assigned to</p>
                    <p className="font-semibold text-blue-700 dark:text-blue-400">
                      {complaint.assignedTo.name || complaint.assignedTo}
                    </p>
                  </div>
                )}

                {/* Admin Remarks */}
                {complaint.adminRemarks && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Admin Remarks</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {complaint.adminRemarks}
                    </p>
                  </div>
                )}

                {/* Images */}
                {complaint.images && complaint.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                      Attached Images
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {complaint.images.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Attachment ${i + 1}`}
                          onClick={() => openLightbox(i)}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 transition-all hover:scale-105"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ FIXED: PDF Download - check both pdfDocument and verificationDocument */}
                {(complaint.pdfDocument || complaint.verificationDocument) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                      Verification Document
                    </h3>
                    <a
                      href={complaint.pdfDocument || complaint.verificationDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all font-semibold"
                    >
                      <RiDownloadLine className="h-5 w-5" />
                      Download PDF Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Timeline */}
          <div className="lg:col-span-1">
            <ComplaintTimeline complaint={complaint} />
          </div>
        </div>

        {/* Image Lightbox */}
        {lightboxOpen && complaint.images && (
          <ImageLightbox
            images={complaint.images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

export default ComplaintDetails
