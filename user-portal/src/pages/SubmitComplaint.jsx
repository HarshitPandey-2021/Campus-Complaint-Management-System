// src/pages/SubmitComplaint.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import api from '../api';
import {
  RiSendPlaneFill,
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiUploadCloudLine,
  RiImageAddLine,
  RiFilePdfLine,
  RiCloseLine,
  RiFlagLine,
  RiMapPinLine,
  RiFileTextLine,
  RiEyeOffLine,
} from 'react-icons/ri';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    location: '',
    priority: '', // ✅ FIXED: No default priority
    description: '',
    isAnonymous: false,
  });
  const [images, setImages] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Category icons mapping
  const categoryIcons = {
    Fan: '🌀',
    Light: '💡',
    Projector: '📽️',
    Furniture: '🪑',
    Washroom: '🚻',
    Water: '💧',
    Internet: '📶',
    Other: '📋',
  };

  // Priority colors
  const priorityColors = {
    Low: {
      selected: 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30',
      unselected: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 hover:border-green-400',
    },
    Medium: {
      selected: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30',
      unselected: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 hover:border-amber-400',
    },
    High: {
      selected: 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30',
      unselected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 hover:border-red-400',
    },
  };

  // ✅ FIXED: Calculate form completion percentage - starts at 0%
  const calculateProgress = () => {
    let completed = 0;
    const fieldWeight = 100 / 6; // 6 fields total

    if (formData.subject.length >= 5) completed += fieldWeight;
    if (formData.category) completed += fieldWeight;
    if (formData.location.length >= 5) completed += fieldWeight;
    if (formData.priority) completed += fieldWeight; // Only counts if priority is selected
    if (formData.description.length >= 20) completed += fieldWeight;
    if (images.length > 0 || pdf) completed += fieldWeight;

    return Math.round(completed);
  };

  const progress = calculateProgress();

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  // Handle priority selection
  const handlePrioritySelect = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
    if (errors.priority) {
      setErrors((prev) => ({ ...prev, priority: '' }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'Subject must not exceed 100 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 5) {
      newErrors.location = 'Location must be at least 5 characters';
    }

    // ✅ FIXED: Priority is now required
    if (!formData.priority) {
      newErrors.priority = 'Please select a priority level';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  // Handle image files
  const handleImageFiles = (files) => {
    if (images.length + files.length > 3) {
      showError('Maximum 3 images allowed');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        showError(`${file.name} is not a valid image (only JPG/PNG allowed)`);
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        showError(`${file.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Handle PDF upload
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Only PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('PDF file must not exceed 5MB');
      return;
    }
    setPdf(file);
  };

  // Remove PDF
  const removePdf = () => {
    setPdf(null);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showError('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const submitData = new FormData();
      submitData.append('subject', formData.subject);
      submitData.append('category', formData.category);
      submitData.append('location', formData.location);
      submitData.append('priority', formData.priority);
      submitData.append('description', formData.description);
      submitData.append('isAnonymous', formData.isAnonymous);

      images.forEach((img) => {
        submitData.append('images', img.file);
      });

      if (pdf) {
        submitData.append('pdfDocument', pdf);
      }

      const response = await api.submitComplaint(submitData, token);
      success(`Complaint ${response.id || response.complaint?.complaintId || ''} submitted successfully!`);
      setTimeout(() => navigate('/user/dashboard'), 1000);
    } catch (err) {
      console.error('Submit error:', err);
      showError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Character counter color
  const getCounterColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return 'text-green-600 dark:text-green-400';
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // ✅ FIXED: Require 83% (5 out of 6 required fields) to enable submit
  const canSubmit = progress >= 83;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors group"
          >
            <RiArrowLeftLine className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Submit New Complaint
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Fill out the form below to report an issue on campus
          </p>
        </div>

        {/* Progress Bar */}
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 mb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Form Progress</p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {progress}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {canSubmit && (
                <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <RiCheckLine className="h-4 w-4" />
                  <span className="text-xs font-bold hidden sm:inline">Ready!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 sm:px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RiFileTextLine className="h-5 w-5" />
                Basic Information
              </h2>
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Brief description of the issue"
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.subject
                        ? 'border-red-500 focus:ring-red-500'
                        : formData.subject.length >= 5
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
                  />
                  {formData.subject.length >= 5 && !errors.subject && (
                    <RiCheckLine className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  {errors.subject && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <RiErrorWarningLine className="h-4 w-4" />
                      {errors.subject}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-medium ${getCounterColor(formData.subject.length, 100)}`}>
                    {formData.subject.length}/100
                  </p>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.category === cat
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg scale-[1.02]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{categoryIcons[cat]}</div>
                      <p
                        className={`text-xs sm:text-sm font-medium ${
                          formData.category === cat
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {cat}
                      </p>
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                    <RiErrorWarningLine className="h-4 w-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiMapPinLine className="inline h-4 w-4 mr-1" />
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Room 301, Block A"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.location
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.location.length >= 5
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.location && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1.5">
                    <RiErrorWarningLine className="h-4 w-4" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Priority - ✅ FIXED: No default selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <RiFlagLine className="inline h-4 w-4 mr-1" />
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITIES.map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => handlePrioritySelect(priority)}
                      className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
                        formData.priority === priority
                          ? priorityColors[priority].selected
                          : priorityColors[priority].unselected
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
                {errors.priority && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                    <RiErrorWarningLine className="h-4 w-4" />
                    {errors.priority}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={5}
                  placeholder="Provide detailed description of the issue..."
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.description.length >= 20
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all resize-none`}
                />
                <div className="flex justify-between items-center mt-1.5">
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <RiErrorWarningLine className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-medium ${getCounterColor(formData.description.length, 500)}`}>
                    {formData.description.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-5 sm:px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RiUploadCloudLine className="h-5 w-5" />
                Attachments (Optional)
              </h2>
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <RiImageAddLine className="inline h-4 w-4 mr-1" />
                  Upload Images (Max 3, 2MB each)
                </label>
                {images.length < 3 && (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-200 ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={(e) => handleImageFiles(Array.from(e.target.files))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <RiUploadCloudLine
                        className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 ${
                          dragActive ? 'text-indigo-500' : 'text-gray-400'
                        }`}
                      />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {dragActive ? 'Drop images here' : 'Drag & drop images here'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        or click to browse ({images.length}/3)
                      </p>
                    </div>
                  </div>
                )}

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                      >
                        <img
                          src={image.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <RiCloseLine className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <RiFilePdfLine className="inline h-4 w-4 mr-1" />
                  Supporting Document (PDF only, Max 5MB)
                </label>
                {!pdf ? (
                  <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-400 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <RiFilePdfLine className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-gray-400 group-hover:text-red-500 transition-colors" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to upload PDF
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex-shrink-0 p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <RiFilePdfLine className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {pdf.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(pdf.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      className="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <RiCloseLine className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-2 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <RiEyeOffLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Submit Anonymously
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your identity will be hidden from public view. Admins will still see your details for verification.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <RiSendPlaneFill className="h-5 w-5" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;