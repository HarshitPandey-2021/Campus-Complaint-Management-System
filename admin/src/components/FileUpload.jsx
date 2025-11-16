// admin/src/components/FileUpload.jsx

import { useState, useRef } from 'react';
import { RiFileUploadLine, RiFilePdfLine, RiCloseLine, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';

export default function FileUpload({ 
  label = "Upload Application Letter (PDF)", 
  maxSizeMB = 5,
  required = false,
  onChange,
  error: externalError = ''
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (selectedFile) => {
    setError('');

    if (!selectedFile) {
      setError('Please select a file');
      return false;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return false;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    if (selectedFile.size === 0) {
      setError('File is empty or corrupted');
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setError('');
      if (onChange) {
        onChange(selectedFile);
      }
    } else {
      setFile(null);
      if (onChange) {
        onChange(null);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const displayError = externalError || error;

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!file ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200 cursor-pointer
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
              : displayError
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4
              ${displayError 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : 'bg-indigo-100 dark:bg-indigo-900/30'
              }
            `}>
              {displayError ? (
                <RiErrorWarningLine className="h-8 w-8 text-red-600 dark:text-red-400" />
              ) : (
                <RiFileUploadLine className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>

            <p className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {isDragging ? 'Drop PDF file here' : 'Drop PDF here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Max file size: {maxSizeMB}MB • Only PDF format
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <RiFilePdfLine className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <RiCheckLine className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {file.name}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
              title="Remove file"
            >
              <RiCloseLine className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </button>
          </div>
        </div>
      )}

      {displayError && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
          <RiErrorWarningLine className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>{displayError}</p>
        </div>
      )}

      {!displayError && !file && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Upload your formal application letter addressed to Dean/HOD in PDF format.
        </p>
      )}
    </div>
  );
}