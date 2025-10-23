// src/pages/Profile.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { 
  RiUserFill, 
  RiMailFill, 
  RiShieldUserFill, 
  RiLogoutBoxRLine,
  RiEditLine,
  RiSaveLine,
  RiCloseLine,
  RiLockPasswordLine,
  RiCalendarLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';

const Profile = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();

  // Profile data (mock)
  const [profileData, setProfileData] = useState({
    name: 'Jane Doe',
    email: 'admin@college.edu',
    role: 'System Administrator',
    department: 'IT Department',
    phone: '+1 (555) 123-4567',
    joinedDate: '2023-01-15',
    lastLogin: new Date().toISOString()
  });

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Activity log (mock)
  const activities = [
    { id: 1, action: 'Resolved complaint #8', date: '2025-01-23T10:30:00', type: 'success' },
    { id: 2, action: 'Updated complaint #3 status', date: '2025-01-23T09:15:00', type: 'info' },
    { id: 3, action: 'Logged in', date: '2025-01-23T08:00:00', type: 'default' },
    { id: 4, action: 'Exported complaints report', date: '2025-01-22T16:45:00', type: 'info' },
    { id: 5, action: 'Started work on complaint #6', date: '2025-01-22T14:20:00', type: 'warning' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('ccms-admin-session');
    localStorage.removeItem('dashboard-welcome-seen');
    success('👋 Logged out successfully!');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleSaveProfile = () => {
    // Mock save
    setProfileData(editedData);
    setIsEditing(false);
    success('✅ Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      error('❌ Please fill all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      error('❌ New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      error('❌ Password must be at least 6 characters');
      return;
    }

    // Mock password change
    success('✅ Password changed successfully!');
    setShowPasswordChange(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success':
        return <RiCheckboxCircleLine className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <RiEditLine className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <RiCalendarLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <RiUserFill className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and view activity history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-4">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.role}</p>
              <span className="mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>

            {/* Quick Stats */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Actions</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">247</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Resolved</span>
                <span className="font-semibold text-green-600 dark:text-green-400">187</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">This Week</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">23</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-sm"
            >
              <RiLogoutBoxRLine className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Right Column - Details & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Profile Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <RiEditLine className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <RiSaveLine className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <RiCloseLine className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiUserFill className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {profileData.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiMailFill className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {profileData.email}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiShieldUserFill className="inline h-4 w-4 mr-1" />
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.department}
                    onChange={(e) => setEditedData({ ...editedData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {profileData.department}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📞 Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.phone}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {profileData.phone}
                  </p>
                )}
              </div>

                           {/* Joined Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiCalendarLine className="inline h-4 w-4 mr-1" />
                  Joined Date
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {new Date(profileData.joinedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Last Login */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🕐 Last Login
                </label>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {formatDate(profileData.lastLogin)}
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Security Settings
              </h3>
              {!showPasswordChange && (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  <RiLockPasswordLine className="h-4 w-4" />
                  <span>Change Password</span>
                </button>
              )}
            </div>

            {showPasswordChange && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Password
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswords({ current: '', new: '', confirm: '' });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!showPasswordChange && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Password last changed: <span className="font-medium">15 days ago</span>
              </p>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;