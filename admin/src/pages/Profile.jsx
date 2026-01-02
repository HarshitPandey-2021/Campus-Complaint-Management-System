// src/pages/Profile.jsx - ADMIN PORTAL (final)

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
    joinedDate: new Date(),
    lastLogin: new Date().toISOString(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name: "", email: "" });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(true);

  const [activities] = useState([
    {
      id: 1,
      action: "Logged in to Dashboard",
      date: new Date().toISOString(),
      type: "success",
    },
    {
      id: 2,
      action: "Viewed complaints list",
      date: new Date(Date.now() - 3600000).toISOString(),
      type: "info",
    },
    {
      id: 3,
      action: "Updated complaint status",
      date: new Date(Date.now() - 7200000).toISOString(),
      type: "success",
    },
  ]);

  useEffect(() => {
    const initProfile = async () => {
      console.log("Profile: fetching from backend...");
      setLoading(true);
      try {
        const token = getAdminToken();
        if (!token) {
          error("Session expired. Please login again.");
          navigate("/unauthorized");
          return;
        }

        const backendProfile = await getProfile(token);
        console.log("Profile loaded from backend:", backendProfile);

        const userId =
          (backendProfile._id &&
            (backendProfile._id.toString
              ? backendProfile._id.toString()
              : String(backendProfile._id))) ||
          backendProfile.userId ||
          "N/A";

        const uiProfile = {
          name: backendProfile.name || "Admin User",
          email: backendProfile.email || "admin@campus.com",
          userId,
          role: backendProfile.role || "Administrator",
          joinedDate: backendProfile.createdAt || new Date(),
          lastLogin: new Date().toISOString(),
        };

        setProfileData(uiProfile);
        setEditedData({ name: uiProfile.name, email: uiProfile.email });

        saveAdminSession(
          {
            name: uiProfile.name,
            email: uiProfile.email,
            role: uiProfile.role,
            userId: uiProfile.userId,
          },
          token
        );

        logActivity(ACTIVITY_TYPES.PROFILE_UPDATE, {
          page: "Profile",
          action: "Viewed profile page",
        });
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
        error("Session expired. Please login again.");
        navigate("/unauthorized");
        return;
      }

      console.log("DEBUG saving profile:", editedData);

      const payload = {
        name: editedData.name,
        // phone/email can be added later when backend supports it
      };

      await updateProfile(payload, token);

      const updated = {
        ...profileData,
        name: editedData.name,
        email: editedData.email,
      };

      setProfileData(updated);
      setIsEditing(false);

      saveAdminSession(
        {
          name: updated.name,
          email: updated.email,
          role: updated.role,
          userId: updated.userId,
        },
        token
      );

      logActivity(ACTIVITY_TYPES.PROFILE_UPDATE, {
        action: "Updated profile details",
        name: editedData.name,
        email: editedData.email,
      });

      success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      error(err.message || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setEditedData({ name: profileData.name, email: profileData.email });
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    try {
      if (!passwords.current || !passwords.new || !passwords.confirm) {
        error("Please fill all password fields");
        return;
      }
      if (passwords.new !== passwords.confirm) {
        error("New passwords do not match");
        return;
      }
      if (passwords.new.length < 6) {
        error("Password must be at least 6 characters");
        return;
      }

      const token = getAdminToken();
      if (!token) {
        error("Session expired. Please login again.");
        navigate("/unauthorized");
        return;
      }

      await changePassword(
        {
          currentPassword: passwords.current,
          newPassword: passwords.new,
        },
        token
      );

      logActivity(ACTIVITY_TYPES.PASSWORD_CHANGE, {
        action: "Password updated successfully",
      });

      success("Password changed successfully!");
      setShowPasswordChange(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("Change password error:", err);
      error(err.message || "Failed to change password");
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <RiCheckboxCircleLine className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "warning":
        return (
          <RiEditLine className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        );
      case "info":
        return (
          <RiCalendarLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        );
      default:
        return (
          <RiUserFill className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <RiUserFill className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Admin Profile
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and view recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
                {profileData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {profileData.role}
              </p>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <RiUserFill className="h-4 w-4" />
                  User ID
                </span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 truncate bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs">
                  {profileData.userId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Last Login
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatDate(profileData.lastLogin)}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-lg hover:shadow-xl"
            >
              <RiLogoutBoxRLine className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Column - Details & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <RiShieldUserFill className="h-7 w-7 text-indigo-600" />
                Profile Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <RiEditLine className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    <RiSaveLine className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-sm"
                  >
                    <RiCloseLine className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiUserFill className="h-5 w-5 text-gray-500" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg font-semibold"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    {profileData.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiMailFill className="h-5 w-5 text-gray-500" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono"
                  />
                ) : (
                  <div className="font-mono text-lg text-gray-900 dark:text-white bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    {profileData.email}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex itemscenter gap-2">
                  <RiShieldUserFill className="h-5 w-5 text-gray-500" />
                  Role & Permissions
                </label>
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-sm">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">
                    {profileData.role}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                    Full Access
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiCalendarLine className="h-5 w-5 text-gray-500" />
                  Account Created
                </label>
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl border border-purple-200 dark:border-purple-800 font-mono text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Joined{" "}
                  </span>
                  <span className="font-semibold text-purple-800 dark:text-purple-200">
                    {formatDate(profileData.joinedDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password & Security */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <RiLockPasswordLine className="h-6 w-6 text-indigo-600" />
                Password & Security
              </h3>
              <button
                onClick={() => setShowPasswordChange((prev) => !prev)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 flex items-center gap-1"
              >
                {showPasswordChange ? (
                  <>
                    <RiCloseLine className="h-4 w-4" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <RiEditLine className="h-4 w-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>

            {showPasswordChange ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswords({ current: "", new: "", confirm: "" });
                    }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For security reasons, use a strong password and avoid sharing
                your account with others.
              </p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-2 mb-4">
              <RiHistoryLine className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 text-sm border-b border-gray-100 dark:border-gray-700/60 pb-2 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5">{getActivityIcon(act.type)}</div>
                  <div>
                    <p className="text-gray-900 dark:text-gray-100">
                      {act.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(act.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
