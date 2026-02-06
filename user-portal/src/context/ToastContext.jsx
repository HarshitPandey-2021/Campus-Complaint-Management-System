// src/context/ToastContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import { ToastContainer } from "../components/common/Toast";

export const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, duration = 3000) => {
      addToast(message, "success", duration);
    },
    [addToast]
  );

  const error = useCallback(
    (message, duration = 3000) => {
      addToast(message, "error", duration);
    },
    [addToast]
  );

  const info = useCallback(
    (message, duration = 3000) => {
      addToast(message, "info", duration);
    },
    [addToast]
  );

  const value = { success, error, info };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* ToastContainer ko toasts aur removeToast do */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// ✅ default export so that `import ToastProvider from ...` works
export default ToastProvider;
