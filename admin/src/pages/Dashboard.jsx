// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
// ❌ REMOVED: import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast'; // ✅ This now uses global context
import useCountUp from '../hooks/useCountUp';
import { getAllComplaints, getStats } from '../services/adminService';
import { 
  RiFileListLine, 
  RiTimeLine, 
  RiLoader4Line, 
  RiCheckLine,
  RiArrowRightLine,
  RiBarChartBoxLine,
  RiCalendarLine,
  RiUserLine
} from 'react-icons/ri';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  
  // ✅ UPDATED: Only destructure what we need (no toasts/removeToast)
  const { info, success } = useToast();

  // Animated counters for stats
  const totalCount = useCountUp(stats.total, 1200);
  const pendingCount = useCountUp(stats.pending, 1200);
  const inProgressCount = useCountUp(stats.inProgress, 1200);
  const resolvedCount = useCountUp(stats.resolved, 1200);

  // Load data
  useEffect(() => {
    setTimeout(() => {
      const allComplaints = getAllComplaints();
      setRecentComplaints(allComplaints.slice(0, 5));
      setStats(getStats());
      setLoading(false);
    }, 800);
  }, []);

  // Welcome message
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('dashboard-welcome-seen');
    
    if (!hasSeenWelcome && stats.total > 0) {
      setTimeout(() => {
        if (stats.pending > 0) {
          info(`👋 Welcome back! You have ${stats.pending} pending complaints.`, 4000);
        } else {
          success(`🎉 Great work! All complaints are handled.`, 4000);
        }
        localStorage.setItem('dashboard-welcome-seen', 'true');
      }, 1000);
    }
  }, [stats, info, success]);

  // Navigate with filter
  const handleStatClick = (status) => {
    navigate('/complaints', { state: { filterStatus: status } });
  };

  // Loading skeletons
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer mb-3"></div>
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-shimmer"></div>
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer"></div>
                </div>
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer mb-3"></div>
                <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer"></div>
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer mt-3"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions Skeleton */}
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-shimmer mb-8"></div>

        {/* Recent Complaints Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-enter">
      {/* ❌ REMOVED: <ToastContainer toasts={toasts} removeToast={removeToast} /> */}
      {/* ✅ Toast now renders globally from ToastProvider in App.jsx */}

      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Overview of all campus complaints and their current status.
            </p>
          </div>
          
          {/* Current date/time display */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <RiCalendarLine className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          
          {/* Total Complaints Card */}
          <div 
            onClick={() => handleStatClick('all')}
            className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 cursor-pointer smooth-transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-300">
                <RiFileListLine className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">
              Total Complaints
            </p>
            <p className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">
              {totalCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Click to view all →
            </p>
          </div>

          {/* Pending Card */}
          <div 
            onClick={() => handleStatClick('Pending')}
            className="group bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer smooth-transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <RiTimeLine className="h-7 w-7 text-white" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <p className="text-sm text-white/90 font-semibold uppercase tracking-wide mb-2">
              Pending
            </p>
            <p className="text-4xl font-extrabold text-white">
              {pendingCount}
            </p>
            <p className="text-xs text-white/70 mt-2">
              {pendingCount > 0 ? 'Awaiting action' : 'All clear! 🎉'}
            </p>
          </div>

          {/* In Progress Card */}
          <div 
            onClick={() => handleStatClick('In Progress')}
            className="group bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer smooth-transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <RiLoader4Line className="h-7 w-7 text-white animate-spin-slow" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <p className="text-sm text-gray-900 dark:text-white/90 font-semibold uppercase tracking-wide mb-2">
              In Progress
            </p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
              {inProgressCount}
            </p>
            <p className="text-xs text-gray-800 dark:text-white/70 mt-2">
              {inProgressCount > 0 ? 'Being worked on' : 'Nothing in progress'}
            </p>
          </div>

          {/* Resolved Card */}
          <div 
            onClick={() => handleStatClick('Resolved')}
            className="group bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer smooth-transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <RiCheckLine className="h-7 w-7 text-white" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <p className="text-sm text-white/90 font-semibold uppercase tracking-wide mb-2">
              Resolved
            </p>
            <p className="text-4xl font-extrabold text-white">
              {resolvedCount}
            </p>
            <p className="text-xs text-white/70 mt-2">
              Successfully closed
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
              <p className="text-white/80">Manage complaints efficiently</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/complaints')}
                className="btn-ripple flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-md"
              >
                <RiFileListLine className="h-5 w-5" />
                View All Complaints
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="btn-ripple flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all hover:scale-105 border border-white/30"
              >
                <RiBarChartBoxLine className="h-5 w-5" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Complaints */}
      <section className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Recent Complaints
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Last {recentComplaints.length} submitted complaints
            </p>
          </div>
          <button
            onClick={() => navigate('/complaints')}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm transition-all hover:gap-3 group"
          >
            View All
            <RiArrowRightLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center animate-scaleIn">
            <RiFileListLine className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-bounce-subtle" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No Complaints Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              New complaints will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint, index) => (
              <div
                key={complaint.id}
                onClick={() => navigate('/complaints')}
                className="group bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer smooth-transition animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                    #{complaint.id}
                  </span>
                  <Badge status={complaint.status} />
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {complaint.subject}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span>
                    <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {complaint.category}
                    </span>
                  </div>
                  
                  {/* Priority with glow effect for High */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Priority:</span>
                    <span className={`px-2 py-1 rounded font-semibold ${
                      complaint.priority === 'High' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 glow-high-priority' :
                      complaint.priority === 'Medium' 
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {complaint.priority}
                    </span>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Location: </span>
                    <span className="text-gray-600 dark:text-gray-400">{complaint.location}</span>
                  </div>
                  
                  {/* Submitted By with Anonymous Check */}
                  <div className="sm:col-span-2 text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <RiUserLine className="h-3 w-3" />
                      <span className="font-semibold">Submitted by:</span>
                      {complaint.isAnonymous ? (
                        <span className="italic">Anonymous Student 🕵️</span>
                      ) : (
                        <span>{complaint.submittedBy}</span>
                      )}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <RiCalendarLine className="h-3 w-3" />
                      <span className="font-semibold">Date:</span>
                      <span>
                        {new Date(complaint.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;