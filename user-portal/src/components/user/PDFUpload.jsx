// src/components/user/PDFUpload.jsx
import React, { useRef } from 'react';
import { RiFileAddLine, RiFilePdfLine, RiCloseLine } from 'react-icons/ri';

const PDFUpload = ({ pdf, setPdf }) => {
  const fileInputRef = useRef(null);

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('PDF file must not exceed 5MB');
      return;
    }

    setPdf(file);
  };

  const removePdf = () => {
    setPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Upload Verification Document (Optional)
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        PDF only • Max 5MB
      </p>

      {!pdf ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <RiFileAddLine className="h-5 w-5" />
          <span className="text-sm font-semibold">Upload PDF</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <RiFilePdfLine className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {pdf.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(pdf.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={removePdf}
            className="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        className="hidden"
      />
    </div>
  );
};

export default PDFUpload;