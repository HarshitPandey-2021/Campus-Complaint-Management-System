import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Loading from '../components/common/Loading';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { getComplaintById, updateComplaint } from '../api';
import {
  RiSaveLine, RiArrowLeftLine, RiErrorWarningLine, RiCheckLine,
  RiUploadCloudLine, RiCloseLine, RiMapPinLine, RiFileTextLine,
  RiEyeOffLine, RiFlagLine, RiAlertLine, RiImageLine
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
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [existingPdf, setExistingPdf] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newPdf, setNewPdf] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);

  const categoryIcons = {
    Fan: '🌀', Light: '💡', Projector: '📽️', Furniture: '🪑',
    Washroom: '🚽', Water: '💧', Internet: '📡', Other: '📌'
  };
  const priorityColors = {
    Low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    High: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const data = await getComplaintById(id, token);
        if (!data) {
          showError('Complaint not found');
          navigate('/user/complaints');
          return;
        }
        // Case-insensitive eligibility
        if (!data.status || data.status.toLowerCase() !== 'pending') {
          warning('This complaint cannot be edited anymore');
          navigate(`/user/complaints/${id}`);
          return;
        }
        if (data.assignedTo) {
          warning('Assigned complaints cannot be edited');
          navigate(`/user/complaints/${id}`);
          return;
        }
        setComplaint(data);
        setFormData({
          subject: data.subject || '',
          category: data.category || '',
          location: data.location || '',
          priority: data.priority || 'Medium',
          description: data.description || '',
          isAnonymous: data.isAnonymous || false
        });
        if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
        if (data.pdfDocument) setExistingPdf(data.pdfDocument);
      } catch (err) {
        console.error('Fetch error:', err);
        showError('Failed to load complaint');
        navigate('/user/complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id, navigate, showError, warning]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ---- Image handling ----
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showError(`${file.name} is too large. Max 5MB per image.`);
        return false;
      }
      return true;
    });
    if (validFiles.length > 0) {
      setNewImages(prev => [...prev, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
        reader.readAsDataURL(file);
      });
    }
  };
  const handleRemoveExistingImage = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ---- PDF handling ----
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError('PDF file is too large. Max 10MB.');
        return;
      }
      setNewPdf(file);
      setPdfPreview({ name: file.name, size: file.size });
    }
  };
  const handleRemoveExistingPdf = () => setExistingPdf(null);
  const handleRemoveNewPdf = () => { setNewPdf(null); setPdfPreview(null); };

  const validate = () => {
    const newErrors = {};
    if (formData.subject.trim().length < 5) newErrors.subject = 'Subject must be at least 5 characters';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (formData.location.trim().length < 5) newErrors.location = 'Location must be at least 5 characters';
    if (formData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showError('Please fix the errors before saving');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      submitData.append('subject', formData.subject);
      submitData.append('category', formData.category);
      submitData.append('location', formData.location);
      submitData.append('priority', formData.priority);
      submitData.append('description', formData.description);
      submitData.append('isAnonymous', formData.isAnonymous);
      existingImages.forEach(url => submitData.append('existingImages[]', url));
      if (existingPdf) submitData.append('existingPdf', existingPdf);
      newImages.forEach(file => submitData.append('images', file));
      if (newPdf) submitData.append('pdfDocument', newPdf);

      const result = await updateComplaint(id, submitData, token);
      if (result) {
        success('Complaint updated successfully! 🎉');
        setTimeout(() => { navigate(`/user/complaints/${id}`); }, 500);
      } else {
        showError('Failed to update complaint');
      }
    } catch (err) {
      console.error('Update error:', err);
      showError(err.response?.data?.message || 'Failed to update complaint. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Complaint not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fadeIn">
          <button
            onClick={() => navigate(`/user/complaints/${id}`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4 group"
          >
            <RiArrowLeftLine className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-semibold">Back to Details</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
            Edit Complaint
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Update your complaint information
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <RiFileTextLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of the issue..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {errors.subject && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <RiErrorWarningLine className="h-4 w-4" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'category', value: cat } })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.category === cat
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{categoryIcons[cat]}</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat}</div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <RiErrorWarningLine className="h-4 w-4" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <RiMapPinLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Building, Room, Floor..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {errors.location && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <RiErrorWarningLine className="h-4 w-4" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <RiFlagLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Priority *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITIES.map(pri => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'priority', value: pri } })}
                  className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                    formData.priority === pri
                      ? priorityColors[pri]
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <RiAlertLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="Provide detailed information about the issue..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              maxLength="500"
            />
            <div className="flex items-center justify-between mt-2">
              {errors.description ? (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <RiErrorWarningLine className="h-4 w-4" />
                  {errors.description}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.description.length}/500 characters
                </p>
              )}
              {formData.description.length >= 20 && (
                <RiCheckLine className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>

          {/* Anonymous Checkbox */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="flex items-center gap-2">
                <RiEyeOffLine className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Submit this complaint anonymously
                </span>
              </div>
            </label>
          </div>

          {/* Existing Images Section */}
          {existingImages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <RiImageLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Current Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              <RiUploadCloudLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Add New Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="new-images"
              />
              <label htmlFor="new-images" className="cursor-pointer">
                <RiImageLine className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload new images
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </label>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`New preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

         {/* Existing PDF Section */}
{existingPdf && (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
      <RiFileTextLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      Current PDF Document
    </label>
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <RiFileTextLine className="w-8 h-8 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Current document.pdf
        </p>
        {/* ✅ FIXED: Use Google Docs Viewer for raw URLs */}
        <a
          href={existingPdf.includes('/raw/upload/') 
            ? `https://docs.google.com/viewer?url=${encodeURIComponent(existingPdf)}&embedded=true`
            : existingPdf
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View current PDF
        </a>
      </div>
      <button
        type="button"
        onClick={handleRemoveExistingPdf}
        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
      >
        <RiCloseLine className="w-5 h-5" />
      </button>
    </div>
  </div>
)}


          {/* New PDF Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              <RiUploadCloudLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              {existingPdf ? 'Replace PDF Document (Optional)' : 'Upload PDF Document (Optional)'}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
                id="new-pdf"
              />
              <label htmlFor="new-pdf" className="cursor-pointer">
                <RiFileTextLine className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload {existingPdf ? 'new' : 'a'} PDF
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PDF up to 10MB
                </p>
              </label>
            </div>

            {/* New PDF Preview */}
            {pdfPreview && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700 mt-4">
                <RiFileTextLine className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {pdfPreview.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(pdfPreview.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveNewPdf}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {saving ? (
                <>
                  <LoadingSpinner className="w-5 h-5" />
                  Updating...
                </>
              ) : (
                <>
                  <RiSaveLine className="w-5 h-5" />
                  Update Complaint
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/user/complaints/${id}`)}
              disabled={saving}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaint;
