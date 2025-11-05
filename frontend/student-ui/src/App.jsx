import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import ComplaintFormPage from "./components/complaints/complainForm.jsx";
import ComplaintListPage from "./components/complaints/complaintList.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/complaint/new" element={<ComplaintFormPage />} />
          <Route path="/complaints" element={<ComplaintListPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
