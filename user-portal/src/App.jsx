import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import Profile from './pages/Profile';
import ToastTest from './pages/ToastTest';
import EditComplaint from './pages/EditComplaint';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
          <ToastProvider>
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
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400">Page Not Found</p>
                    </div>
                  </div>
                } />
              </Routes>
            </Layout>
          </ToastProvider>
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
