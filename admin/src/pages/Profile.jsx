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
      setLoading(true);
      try {
        const token = getAdminToken();
        if (!token) {
          error("Session expired. Please login again.");
          navigate("/unauthorized");
          return;
        }

        const backendProfile = await getProfile(token);

        const userId =
          backendProfile._id?.toString?.() ||
          backendProfile._id ||
          backendProfile.userId ||
          "N/A";

        const uiProfile = {
          name: backendProfile.name || "Admin User",
          email: backendProfile.email || "admin@campus.com",
          userId,
          role: backendProfile.role || "Administrator",
          joinedDate:
            backendProfile.createdAt || backendProfile.joinedDate || null,
          lastLogin: backendProfile.lastLogin || new Date().toISOString(),
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
        action: "Updated profile",
        name: editedData.name,
      });

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
      // API signature: changePassword(currentPassword, newPassword)
      await changePassword(passwords.current, passwords.new);

      logActivity(ACTIVITY_TYPES.PASSWORD_CHANGE, {
        action: "Password updated",
      });

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
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage your account settings
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium"
          >
            <RiLogoutBoxRLine className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Profile card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <RiUserFill className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {profileData.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {profileData.role}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <RiMailFill className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200 break-all">
                    {profileData.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RiShieldUserFill className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200">
                    {profileData.userId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RiCalendarLine className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200">
                    Joined: {formatDate(profileData.joinedDate)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                  Use a strong password and avoid sharing your account.
                </p>
              </div>
            </div>

            {/* Recent Activities - static demo */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RiHistoryLine className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                          act.type === "success"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/40"
                        }`}
                      >
                        <RiCheckboxCircleLine className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                          {act.action}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {formatDateTime(act.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div className="lg:col-span-2 space-y-4">
            {/* Profile edit card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Account Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                  >
                    <RiEditLine className="h-3.5 w-3.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <RiSaveLine className="h-3.5 w-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedData({
                          name: profileData.name,
                          email: profileData.email,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      <RiCloseLine className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedData.name : profileData.name}
                    onChange={(e) =>
                      isEditing &&
                      setEditedData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Password change card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RiLockPasswordLine className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Password
                  </h3>
                </div>
                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                  >
                    Change
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswords({ current: "", new: "", confirm: "" });
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {showPasswordChange && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          current: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            new: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            confirm: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <RiSaveLine className="h-3.5 w-3.5" />
                      Save Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
