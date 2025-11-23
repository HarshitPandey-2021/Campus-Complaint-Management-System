// src/pages/EditComplaint.jsx - COMPLETE EDIT PAGE

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Loading from '../components/common/Loading';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { getComplaintById, updateComplaint } from '../services/userService';
import { 
  RiSaveLine, 
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiUploadCloudLine,
  RiImageAddLine,
  RiFilePdfLine,
  RiCloseLine,
  RiAlertLine,
  RiMapPinLine,
  RiFileTextLine,
  RiEyeOffLine,
  RiEditLine
} from 'react-icons/ri';

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError, warning } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [complaint, setComplaint] = useState(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    location: '',
    priority: 'Medium',
    description: '',
    isAnonymous: false
  });

  const [images, setImages] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Category icons
  const categoryIcons = {
    'Fan': '🌀',
    'Light': '💡',
    'Projector': '📽️',
    'Furniture': '🪑',
    'Washroom': '🚽',
    'Water': '💧',
    'Internet': '📡',
    'Other': '📌'
  };

  // Priority colors
  const priorityColors = {
    'Low': 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    'High': 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
  };

  // Load complaint data
  useEffect(() => {
    setTimeout(() => {
      const data = getComplaintById(id);
      
      if (!data) {
        showError('Complaint not found');
        navigate('/user/complaints');
        return;
      }

      // Check if can edit
      if (data.status !== 'Pending' || data.assignedTo) {
        warning('This complaint cannot be edited anymore');
        navigate(`/user/complaints/${id}`);
        return;
      }

      setComplaint(data);
      setFormData({
        subject: data.subject,
        category: data.category,
        location: data.location,
        priority: data.priority,
        description: data.description,
        isAnonymous: data.isAnonymous
      });
      
      // Set existing images
      if (data.images && data.images.length > 0) {
        setImages(data.images.map((img, index) => ({
          file: null,
          preview: img,
          name: `existing-${index}.jpg`,
          isExisting: true
        })));
      }

      // Set existing PDF
      if (data.verificationDocument) {
        setPdf(data.verificationDocument);
      }

      setLoading(false);
    }, 500);
  }, [id, navigate]);

  // Calculate progress
  const calculateProgress = () => {
    let completed = 0;
    if (formData.subject.length >= 5) completed += 16.66;
    if (formData.category) completed += 16.66;
    if (formData.location.length >= 5) completed += 16.66;
    if (formData.priority) completed += 16.66;
    if (formData.description.length >= 20) completed += 16.66;
    if (images.length > 0 || pdf) completed += 16.66;
    return Math.round(completed);
  };

  const progress = calculateProgress();

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  // Handle priority selection
  const handlePrioritySelect = (priority) => {
    if (priority === 'High' && user?.role === 'student') {
      showError('Only faculty can set High priority');
      return;
    }
    setFormData(prev => ({ ...prev, priority }));
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

    const validFiles = files.filter(file => {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        showError(`${file.name} is not a valid image`);
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        showError(`${file.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      isExisting: false
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      if (!newImages[index].isExisting) {
        URL.revokeObjectURL(newImages[index].preview);
      }
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
      showError('Please fix the errors before saving');
      return;
    }

    setSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedData = {
        ...formData,
        images: images.map(img => img.preview),
        verificationDocument: pdf
      };

      const result = updateComplaint(id, updatedData);

      if (result) {
        success(`Complaint #${id} updated successfully! 🎉`);
        setTimeout(() => {
          navigate(`/user/complaints/${id}`);
        }, 500);
      } else {
        showError('Failed to update complaint');
        setSaving(false);
      }

    } catch (err) {
      showError('Failed to update complaint. Please try again.');
      setSaving(false);
    }
  };

  // Character counter color
  const getCounterColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return 'text-green-600 dark:text-green-400';
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fadeIn">
          <button
            onClick={() => navigate(`/user/complaints/${id}`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors group"
          >
            <RiArrowLeftLine className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-semibold">Back to Details</span>
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-3">
                <RiEditLine className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                Edit Complaint #{id}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Update your complaint details below
              </p>
            </div>
            
            {/* Progress Circle */}
            <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-lg border-4 border-indigo-600 dark:border-indigo-400">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progress}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Done</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form - Reuse same structure as SubmitComplaint */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <RiFileTextLine className="h-6 w-6" />
                Basic Information
              </h2>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.subject 
                      ? 'border-red-500 focus:ring-red-500' 
                      : formData.subject.length >= 5
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                  } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 transition-all`}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.subject && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <RiErrorWarningLine className="h-4 w-4" />
                      {errors.subject}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-semibold ${getCounterColor(formData.subject.length, 100)}`}>
                    {formData.subject.length}/100
                  </p>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.category === cat
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:shadow-md'
                      }`}
                    >
                      <div className="text-3xl mb-2">{categoryIcons[cat]}</div>
                      <p className={`text-sm font-semibold ${
                        formData.category === cat
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {cat}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <RiMapPinLine className="inline h-4 w-4 mr-1" />
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.location 
                      ? 'border-red-500 focus:ring-red-500' 
                      : formData.location.length >= 5
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                  } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 transition-all`}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITIES.filter(p => user?.role === 'faculty' || p !== 'High').map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => handlePrioritySelect(priority)}
                      className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                        formData.priority === priority
                          ? `${priorityColors[priority]} shadow-lg scale-105`
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : formData.description.length >= 20
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                  } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 transition-all resize-none`}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <RiErrorWarningLine className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-semibold ${getCounterColor(formData.description.length, 500)}`}>
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Images & PDF - Same as submit, but with existing files shown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <RiUploadCloudLine className="h-6 w-6" />
                Attachments (Optional)
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Image previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img src={image.preview} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <RiCloseLine className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-5 h-5 mt-1 rounded text-indigo-600 focus:ring-2"
              />
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200">Submit Anonymously</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hide your identity from public view</p>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(`/user/complaints/${id}`)}
              disabled={saving}
              className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                <>
                  <RiSaveLine className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditComplaint;