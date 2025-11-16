// src/context/ToastContext.jsx - CREATE THIS NEW FILE

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RiCheckFill, RiErrorWarningFill, RiInformationFill, RiCloseLine } from 'react-icons/ri';

const ToastContext = createContext(null);

let toastId = 0;

// Individual Toast Component
const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  React.useEffect(() => {
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
    <div className={`${styles.bg} text-white rounded-lg shadow-2xl overflow-hidden max-w-md animate-slideInRight`}>
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
  );
};

// Toast Container (renders via Portal to document.body)
const ToastContainer = ({ toasts, removeToast }) => {
  // Portal ensures toast renders at body level, bypassing all parent transforms/positioning
  return createPortal(
    <div 
      className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none"
      style={{ position: 'fixed' }}
    >
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 3000) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration = 3000) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const info = useCallback((message, duration = 3000) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast from any component
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};