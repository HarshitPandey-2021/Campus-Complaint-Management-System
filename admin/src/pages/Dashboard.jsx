// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getAllComplaints, getStats } from '../services/adminService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  
  const { toasts, removeToast, info } = useToast();

  useEffect(() => {
    setTimeout(() => {
      const allComplaints = getAllComplaints();
      setRecentComplaints(allComplaints.slice(0, 5));
      setStats(getStats());
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('dashboard-welcome-seen');
    
    if (!hasSeenWelcome && stats) {
      setTimeout(() => {
        info(`👋 Welcome back! You have ${stats.pending} pending complaints.`, 4000);
        localStorage.setItem('dashboard-welcome-seen', 'true');
      }, 800);
    }
  }, [stats, info]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Loading Dashboard...</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of all campus complaints and their current status.
        </p>
      </div>

      {/* Stats Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Card */}
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/complaints')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div 
            className="bg-blue-400 dark:bg-blue-600 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/complaints')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Pending</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 dark:bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          {/* In Progress Card */}
          <div 
            className="bg-yellow-500 dark:bg-yellow-600 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/complaints')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 dark:bg-yellow-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
            </div>
          </div>

          {/* Resolved Card */}
          <div 
            className="bg-green-500 dark:bg-green-600 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/complaints')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Resolved</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Complaints */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Recent Complaints</h2>
          <button
            onClick={() => navigate('/complaints')}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm flex items-center gap-1 transition-colors"
          >
            View All
            <span>→</span>
          </button>
        </div>

        <div className="space-y-4">
          {recentComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/complaints')}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">#{complaint.id}</span>
                <Badge status={complaint.status} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{complaint.subject}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Category:</span> {complaint.category}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> {complaint.priority}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium">Location:</span> {complaint.location}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium">Submitted:</span>{' '}
                  {new Date(complaint.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;