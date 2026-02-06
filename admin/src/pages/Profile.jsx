// src/pages/Profile.jsx - FIXED: Correct date, contained buttons
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
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
  RiCheckboxCircleLine,
  RiHistoryLine,
} from "react-icons/ri";
import {
  getAdminToken,
  logoutAdmin,
  saveAdminSession,
} from "../utils/tokenUtils";
import { logActivity, ACTIVITY_TYPES } from "../services/activityLogger";
import { getProfile, updateProfile, changePassword } from "../api";

const Profile = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [profileData, setProfileData] = useState({
    name: "Loading...",
    email: "Loading...",
    userId: "Loading...",
    role: "Loading...",
    joinedDate: null,
    lastLogin: new Date().toISOString(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name: "", email: "" });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(true);

  const [activities] = useState([
    { id: 1, action: "Logged in to Dashboard", date: new Date().toISOString(), type: "success" },
    { id: 2, action: "Viewed complaints list", date: new Date(Date.now() - 3600000).toISOString(), type: "info" },
    { id: 3, action: "Updated complaint status", date: new Date(Date.now() - 7200000).toISOString(), type: "success" },
  ]);

  useEffect(() => {
    const initProfile = async () => {
      setLoading(true);
      try {
        const token = getAdminToken();
        if (!token) {
          error("Session expired. Please login again.");
          navigate("/unauthorized");
          return;
        }

        const backendProfile = await getProfile(token);

        const userId = backendProfile._id?.toString?.() || backendProfile._id || backendProfile.userId || "N/A";

        // FIXED: Use createdAt from backend, not current time
        const uiProfile = {
          name: backendProfile.name || "Admin User",
          email: backendProfile.email || "admin@campus.com",
          userId,
          role: backendProfile.role || "Administrator",
          joinedDate: backendProfile.createdAt || backendProfile.joinedDate || null,
          lastLogin: backendProfile.lastLogin || new Date().toISOString(),
        };

        setProfileData(uiProfile);
        setEditedData({ name: uiProfile.name, email: uiProfile.email });

        saveAdminSession({
          name: uiProfile.name,
          email: uiProfile.email,
          role: uiProfile.role,
          userId: uiProfile.userId,
        }, token);

        logActivity(ACTIVITY_TYPES.PAGE_VIEW, { page: "Profile" });
      } catch (err) {
        console.error("Profile init error:", err);
        error(err.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [navigate, error]);

  const handleLogout = () => {
    logActivity(ACTIVITY_TYPES.LOGOUT, { page: "Profile" });
    logoutAdmin();
    success("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "http://localhost:5174";
    }, 1000);
  };

  const handleSaveProfile = async () => {
    try {
      const token = getAdminToken();
      if (!token) {
        error("Session expired.");
        return;
      }

      await updateProfile({ name: editedData.name }, token);

      const updated = { ...profileData, name: editedData.name, email: editedData.email };
      setProfileData(updated);
      setIsEditing(false);

      saveAdminSession({
        name: updated.name,
        email: updated.email,
        role: updated.role,
        userId: updated.userId,
      }, token);

      logActivity(ACTIVITY_TYPES.PROFILE_UPDATE, { action: "Updated profile", name: editedData.name });
      success("Profile updated!");
    } catch (err) {
      error(err.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      error("Please fill all password fields");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      error("Passwords do not match");
      return;
    }
    if (passwords.new.length < 6) {
      error("Password must be at least 6 characters");
      return;
    }

    try {
      const token = getAdminToken();
      await changePassword({ currentPassword: passwords.current, newPassword: passwords.new }, token);
      logActivity(ACTIVITY_TYPES.PASSWORD_CHANGE, { action: "Password updated" });
      success("Password changed!");
      setShowPasswordChange(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      error(err.message || "Failed to change password");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <RiUserFill className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
              Admin Profile
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 sm:p-6 sticky top-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg mb-3">
                  {profileData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 text-center">
                  {profileData.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.role}</p>
                <span className="mt-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User ID</span>
                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded truncate max-w-[120px]">
                    {profileData.userId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
              >
                <RiLogoutBoxRLine className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <RiShieldUserFill className="h-5 w-5 text-indigo-600" />
                  Profile Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all"
                  >
                    <RiEditLine className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm"
                    >
                      <RiSaveLine className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => { setEditedData({ name: profileData.name, email: profileData.email }); setIsEditing(false); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm"
                    >
                      <RiCloseLine className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <RiUserFill className="inline h-4 w-4 mr-1" /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg font-medium text-gray-900 dark:text-white">
                      {profileData.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <RiMailFill className="inline h-4 w-4 mr-1" /> Email
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm text-gray-900 dark:text-white break-all">
                    {profileData.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <RiShieldUserFill className="inline h-4 w-4 mr-1" /> Role
                  </label>
                  <p className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg font-medium text-emerald-700 dark:text-emerald-300">
                    {profileData.role}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <RiCalendarLine className="inline h-4 w-4 mr-1" /> Account Created
                  </label>
                  <p className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg font-medium text-purple-700 dark:text-purple-300">
                    {formatDate(profileData.joinedDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <RiLockPasswordLine className="h-5 w-5 text-indigo-600" />
                  Security
                </h3>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {showPasswordChange ? "Close" : "Change Password"}
                </button>
              </div>

              {showPasswordChange ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => { setShowPasswordChange(false); setPasswords({ current: "", new: "", confirm: "" }); }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use a strong password and avoid sharing your account.
                </p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <RiHistoryLine className="h-5 w-5 text-indigo-600" />
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-sm pb-3 border-b last:border-0">
                    <RiCheckboxCircleLine className={`h-5 w-5 flex-shrink-0 ${act.type === 'success' ? 'text-green-600' : 'text-blue-600'}`} />
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">{act.action}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(act.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;