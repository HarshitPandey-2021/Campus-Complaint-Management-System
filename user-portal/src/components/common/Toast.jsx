// src/components/common/Toast.jsx

import React, { useEffect } from 'react';
import { RiCheckFill, RiErrorWarningFill, RiInformationFill, RiCloseLine } from 'react-icons/ri';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: <RiCheckFill className="h-6 w-6 text-white" />,
          progress: 'bg-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <RiErrorWarningFill className="h-6 w-6 text-white" />,
          progress: 'bg-red-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          icon: <RiInformationFill className="h-6 w-6 text-white" />,
          progress: 'bg-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-500',
          icon: <RiInformationFill className="h-6 w-6 text-white" />,
          progress: 'bg-gray-700'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="w-full max-w-md animate-slideInRight">
      <div className={`${styles.bg} text-white rounded-lg shadow-2xl overflow-hidden`}>
        <div className="flex items-center gap-3 p-4">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <p className="flex-1 font-medium text-sm">{message}</p>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Close notification"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white bg-opacity-30">
          <div 
            className={`h-full ${styles.progress} animate-toastProgress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed inset-x-0 top-4 z-[70] flex flex-col items-center space-y-3 px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
          // Allow clicks inside toast but keep container non-blocking
        />
      ))}
    </div>
  );
};

export default Toast;