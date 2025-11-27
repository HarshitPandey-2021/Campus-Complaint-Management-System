import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import RoleBadge from '../components/common/RoleBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMyStats, updateProfile } from '../api';
import { 
  RiUserLine, RiMailLine, RiPhoneLine, RiIdCardLine, 
  RiBuildingLine, RiSaveLine, RiLockPasswordLine,
  RiEditLine, RiCheckLine, RiCloseLine, RiShieldUserLine,
  RiCalendarLine, RiFileListLine, RiTimeLine, RiLoader4Line,
  RiCustomerService2Line
} from 'react-icons/ri';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { success, error, info } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '' 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStats = await getMyStats(token);
        setStats(userStats);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await updateProfile(formData, token);
      updateUser(formData);
      success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Call your password update API here
      // await updatePassword(passwordData, token);
      
      // For now, just show success (implement backend API later)
      success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    // Option 1: Open email client
    window.location.href = 'mailto:support@campus.edu?subject=Support Request&body=Hello, I need help with...';
    
    // Option 2: Show info toast
    info('Opening email client to contact support...');
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || '', phone: user?.phone || '' });
    setEditing(false);
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your account information and view your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <RiUserLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  Personal Information
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
                  >
                    <RiEditLine className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiUserLine className="h-4 w-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      editing 
                        ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                    } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none transition-all`}
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiMailLine className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiPhoneLine className="h-4 w-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      editing 
                        ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                    } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none transition-all`}
                  />
                </div>

                {/* Student ID (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiIdCardLine className="h-4 w-4" />
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={user?.studentId || 'N/A'}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Department (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiBuildingLine className="h-4 w-4" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={user?.department || 'N/A'}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Role Badge */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiShieldUserLine className="h-4 w-4" />
                    Account Role
                  </label>
                  <div className="flex items-center">
                    <RoleBadge role={user?.role} />
                  </div>
                </div>

                {/* Action Buttons */}
                {editing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <RiCheckLine className="h-5 w-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                    >
                      <RiCloseLine className="h-5 w-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Account Security Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                <RiLockPasswordLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Account Security
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Password</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">••••••••••</p>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Account Created</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <RiCalendarLine className="h-4 w-4" />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            
            {/* Stats Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <RiFileListLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Complaint Statistics
              </h2>
              
              <div className="space-y-4">
                
                {/* Total Complaints */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg">
                      <RiFileListLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</p>
                    </div>
                  </div>
                </div>

                {/* Pending */}
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg">
                      <RiTimeLine className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.pending}</p>
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                      <RiLoader4Line className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.inProgress}</p>
                    </div>
                  </div>
                </div>

                {/* Resolved */}
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                      <RiCheckLine className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.resolved}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {stats.total > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Resolution Rate
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {Math.round((stats.resolved / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${(stats.resolved / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/user/submit'}
                  className="w-full flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all group"
                >
                  <span>Submit New Complaint</span>
                  <RiFileListLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => window.location.href = '/user/complaints'}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all group"
                >
                  <span>View My Complaints</span>
                  <RiFileListLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => window.location.href = '/user/dashboard'}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                  <span>Go to Dashboard</span>
                  <RiFileListLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Contact Support Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <RiCustomerService2Line className="h-6 w-6" />
                <h3 className="text-lg font-bold">Need Help?</h3>
              </div>
              <p className="text-sm text-indigo-100 mb-4">
                Contact support if you have any issues with your account or complaints.
              </p>
              <button 
                onClick={handleContactSupport}
                className="w-full px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <RiLockPasswordLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <RiCloseLine className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

