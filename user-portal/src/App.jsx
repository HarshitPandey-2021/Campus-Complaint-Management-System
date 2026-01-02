// src/App.jsx (user portal - 3001)
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Profile from "./pages/Profile";
import ToastTest from "./pages/ToastTest";
import EditComplaint from "./pages/EditComplaint";

// Helper: read ?auth and persist token/user
function useAuthFromQuery() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");

    console.log("AuthContext.jsx:15 🔍 Checking auth...");
    console.log("AuthContext.jsx:16 Auth param in URL:", !!authParam);

    if (!authParam) return;

    try {
      const { token, user } = JSON.parse(decodeURIComponent(authParam));
      console.log("AuthContext.jsx:21 ✅ Auth data from URL:", { token, user });

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Clean query param from URL
        params.delete("auth");
        const newQuery = params.toString();
        const newUrl =
          window.location.origin +
          window.location.pathname +
          (newQuery ? `?${newQuery}` : "");
        window.history.replaceState({}, "", newUrl);

        console.log("AuthContext.jsx:36 ✅ Auth saved, URL cleaned");
      }
    } catch (e) {
      console.error("Invalid auth data in URL", e);
    }
  }, []);
}

function App() {
  useAuthFromQuery();

  return (
    <Layout>
      <Routes>
        {/* default → dashboard */}
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />

        <Route path="/user/dashboard" element={<Dashboard />} />
        <Route path="/user/submit" element={<SubmitComplaint />} />
        <Route path="/user/complaints" element={<MyComplaints />} />
        <Route path="/user/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/user/complaints/:id/edit" element={<EditComplaint />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/toast-test" element={<ToastTest />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">404</h1>
                <p className="text-gray-600">Page Not Found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
