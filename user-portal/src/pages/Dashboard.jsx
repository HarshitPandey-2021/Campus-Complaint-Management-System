// src/pages/Dashboard.jsx - CLEAN VERSION (NO TEST BUTTONS)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Badge from '../components/common/Badge';
import RoleBadge from '../components/common/RoleBadge';
import Loading from '../components/common/Loading';
import useCountUp from '../hooks/useCountUp';
import { getMyComplaints, getMyStats } from '../services/userService';
import { 
  RiFileListLine, 
  RiTimeLine, 
  RiLoader4Line, 
  RiCheckLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiAddCircleLine,
  RiMapPinLine
} from 'react-icons/ri';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { info, success } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  const totalCount = useCountUp(stats.total, 1200);
  const pendingCount = useCountUp(stats.pending, 1200);
  const inProgressCount = useCountUp(stats.inProgress, 1200);
  const resolvedCount = useCountUp(stats.resolved, 1200);

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setRecentComplaints(getMyComplaints().slice(0, 5));
      setStats(getMyStats());
      setLoading(false);
    }, 800);
  }, []);

  // Welcome message
// Welcome message
useEffect(() => {
  if (!loading) {
    setTimeout(() => {
      if (stats.pending > 0) {
        info(`👋 Welcome back! You have ${stats.pending} complaint${stats.pending > 1 ? 's' : ''} waiting to be reviewed by admin.`);
      } else if (stats.total > 0) {
        success(`🎉 Great! All your complaints are being handled or resolved!`);
      } else {
        info(`👋 Welcome! Submit your first complaint to get started.`);
      }
    }, 1500);
  }
}, [loading]);

  const handleStatClick = (status) => {
    navigate('/user/complaints', { state: { filterStatus: status } });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track and manage your campus complaints all in one place.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <RiCalendarLine className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div onClick={() => handleStatClick('all')} className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform">
                <RiFileListLine className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">My Complaints</p>
            <p className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">{totalCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Click to view all →</p>
          </div>

          <div onClick={() => handleStatClick('Pending')} className="group bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <RiTimeLine className="h-7 w-7 text-white" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-white/90 font-semibold uppercase tracking-wide mb-2">Pending</p>
            <p className="text-4xl font-extrabold text-white">{pendingCount}</p>
            <p className="text-xs text-white/70 mt-2">{pendingCount > 0 ? 'Awaiting action' : 'All clear! 🎉'}</p>
          </div>

          <div onClick={() => handleStatClick('In Progress')} className="group bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <RiLoader4Line className="h-7 w-7 text-white" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-gray-900 font-semibold uppercase tracking-wide mb-2">In Progress</p>
            <p className="text-4xl font-extrabold text-gray-900">{inProgressCount}</p>
            <p className="text-xs text-gray-800 mt-2">{inProgressCount > 0 ? 'Being worked on' : 'Nothing in progress'}</p>
          </div>

          <div onClick={() => handleStatClick('Resolved')} className="group bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <RiCheckLine className="h-7 w-7 text-white" />
              </div>
              <RiArrowRightLine className="h-5 w-5 text-white/70 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-white/90 font-semibold uppercase tracking-wide mb-2">Resolved</p>
            <p className="text-4xl font-extrabold text-white">{resolvedCount}</p>
            <p className="text-xs text-white/70 mt-2">Successfully closed</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-2">Need to Report an Issue?</h3>
              <p className="text-white/80">Submit a new complaint and we'll get it resolved quickly</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/user/submit')} className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-md">
                <RiAddCircleLine className="h-5 w-5" />
                Submit New Complaint
              </button>
              <button onClick={() => navigate('/user/complaints')} className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all hover:scale-105 border border-white/30">
                <RiFileListLine className="h-5 w-5" />
                View My Complaints
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Complaints */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Recent Complaints</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your last {recentComplaints.length} submitted complaints</p>
          </div>
          {stats.total > 5 && (
            <button onClick={() => navigate('/user/complaints')} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold text-sm transition-all hover:gap-3 group">
              View All
              <RiArrowRightLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {recentComplaints.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
            <RiFileListLine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Complaints Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't submitted any complaints yet.</p>
            <button onClick={() => navigate('/user/submit')} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all hover:scale-105">
              <RiAddCircleLine className="h-5 w-5" />
              Submit Your First Complaint
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <div key={complaint.id} onClick={() => navigate(`/user/complaints/${complaint.id}`)} className="group bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">#{complaint.id}</span>
                  <Badge status={complaint.status} />
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-indigo-600 transition-colors">{complaint.subject}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Category:</span>
                    <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">{complaint.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Priority:</span>
                    <span className={`px-2 py-1 rounded font-semibold ${
                      complaint.priority === 'High' ? 'bg-red-100 text-red-600' :
                      complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>{complaint.priority}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <RiMapPinLine className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-700">Location:</span>
                    <span className="text-gray-600">{complaint.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <RiCalendarLine className="h-3 w-3" />
                    <span className="font-semibold">Submitted:</span>
                    <span>{new Date(complaint.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {complaint.adminRemarks && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Admin Remarks:</p>
                    <p className="text-sm text-gray-700 italic">"{complaint.adminRemarks}"</p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <span className="flex items-center gap-1 text-xs text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                    View Details
                    <RiArrowRightLine className="h-4 w-4" />
                  </span>
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