// src/App.jsx (user portal - 3001)
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Profile from "./pages/Profile";
import ToastTest from "./pages/ToastTest";
import EditComplaint from "./pages/EditComplaint";

// ✅ Helper: read ?auth and persist token/user
function useAuthFromQuery() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");

    if (authParam) {
      try {
        const { token, user } = JSON.parse(decodeURIComponent(authParam));
        console.log("✅ User portal received auth:", { token, user });
        
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Clean query param from URL
        params.delete("auth");
        const newQuery = params.toString();
        const newUrl =
          window.location.origin +
          window.location.pathname +
          (newQuery ? `?${newQuery}` : "");
        window.history.replaceState({}, "", newUrl);
      } catch (e) {
        console.error("Invalid auth data in URL", e);
      }
    }
  }, []);
}

function AppInner() {
  // Handle landing → user app auth
  useAuthFromQuery();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/toast-test" element={<ToastTest />} />
        <Route path="/user/dashboard" element={<Dashboard />} />
        <Route path="/user/submit" element={<SubmitComplaint />} />
        <Route path="/user/complaints" element={<MyComplaints />} />
        <Route path="/user/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/user/complaints/:id/edit" element={<EditComplaint />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  404
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Page Not Found
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
          <ToastProvider>
            <AppInner />
          </ToastProvider>
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
