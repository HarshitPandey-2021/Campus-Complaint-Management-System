// src/pages/Profile.jsx (User Portal - Matching Admin Design)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import RoleBadge from "../components/common/RoleBadge";
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
  RiIdCardLine,
  RiPhoneLine,
  RiBookOpenLine,
} from "react-icons/ri";
import { getMyStats, updateProfile, changePassword } from "../api";

const PASSWORD_HINT =
  "At least 8 characters with 1 uppercase, 1 lowercase, and 1 special character.";
const PASSWORD_EXAMPLE = "Example: Campus@2026";
const isStrongPassword = (pwd) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd || "");

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { success, error } = useToast();

  const [profileData, setProfileData] = useState({
    name: "Loading...",
    email: "Loading...",
    odffUserId: "Loading...",
    role: "Loading...",
    rollNo: "",
    phone: "",
    joinedDate: new Date(),
    lastLogin: new Date().toISOString(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name: "", phone: "" });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [activities] = useState([
    {
      id: 1,
      action: "Logged in to Portal",
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
      action: "Submitted a new complaint",
      date: new Date(Date.now() - 7200000).toISOString(),
      type: "success",
    },
  ]);

  useEffect(() => {
    const initProfile = async () => {
      setLoading(true);
      try {
        if (!user) {
          error("Session expired. Please login again.");
          navigate("/");
          return;
        }

        const userId = user._id || user.id || user.userId || "N/A";

        const uiProfile = {
          name: user.name || "User",
          email: user.email || "user@campus.edu",
          userId: typeof userId === 'object' ? userId.toString() : userId,
          role: user.role || "student",
          rollNo: user.rollNo || user.roll || "",
          phone: user.phone || "",
          joinedDate: user.createdAt || new Date(),
          lastLogin: new Date().toISOString(),
        };

        setProfileData(uiProfile);
        setEditedData({ name: uiProfile.name, phone: uiProfile.phone });

        // Fetch stats
        try {
          const statsData = await getMyStats();
          if (statsData) {
            setStats(statsData);
          }
        } catch (err) {
          console.error("Failed to fetch stats:", err);
        }
      } catch (err) {
        console.error("Profile init error:", err);
        error(err.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [user, navigate, error]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      success("Logged out successfully!");
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);

      const payload = {
        name: editedData.name,
        phone: editedData.phone,
      };

      await updateProfile(payload);

      const updated = {
        ...profileData,
        name: editedData.name,
        phone: editedData.phone,
      };

      setProfileData(updated);
      setIsEditing(false);

      // Update auth context
      if (updateUser) {
        updateUser({ name: editedData.name, phone: editedData.phone });
      }

      success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      error(err.message || "Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData({ name: profileData.name, phone: profileData.phone });
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
      if (!isStrongPassword(passwords.new)) {
        error(PASSWORD_HINT);
        return;
      }

      setPasswordLoading(true);

      await changePassword(passwords.current, passwords.new);

      success("Password changed successfully!");
      setShowPasswordChange(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("Change password error:", err);
      error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
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

  const getRoleLabel = (role) => {
    switch (role?.toLowerCase()) {
      case "student":
        return "Student";
      case "faculty":
        return "Faculty Member";
      case "staff":
        return "Staff Member";
      default:
        return "User";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <RiUserFill className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Manage your account settings and view recent activity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <div className="flex flex-col items-center mb-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl shadow-indigo-500/30 mb-4">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                  {profileData.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {getRoleLabel(profileData.role)}
                </p>
                <RoleBadge role={profileData.role} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.resolved}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Resolved</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <RiIdCardLine className="h-4 w-4" />
                    User ID
                  </span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs truncate max-w-[120px]">
                    {profileData.userId}
                  </span>
                </div>
                {profileData.rollNo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <RiBookOpenLine className="h-4 w-4" />
                      Roll No
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {profileData.rollNo}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Last Login</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                    {formatDate(profileData.lastLogin)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <RiLogoutBoxRLine className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Column - Details & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <RiShieldUserFill className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Profile Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all text-sm"
                  >
                    <RiEditLine className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all text-sm disabled:opacity-50"
                    >
                      {saveLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RiSaveLine className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all text-sm"
                    >
                      <RiCloseLine className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <RiUserFill className="h-4 w-4 text-gray-400" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        {profileData.name}
                      </div>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <RiMailFill className="h-4 w-4 text-gray-400" />
                      Email Address
                    </label>
                    <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 truncate">
                      {profileData.email}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <RiPhoneLine className="h-4 w-4 text-gray-400" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) =>
                          setEditedData({ ...editedData, phone: e.target.value })
                        }
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        {profileData.phone || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Roll Number (for students) */}
                  {profileData.rollNo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <RiIdCardLine className="h-4 w-4 text-gray-400" />
                        Roll Number
                      </label>
                      <div className="font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        {profileData.rollNo}
                      </div>
                    </div>
                  )}
                </div>

                {/* Role & Access */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <RiShieldUserFill className="h-4 w-4 text-gray-400" />
                    Role & Access
                  </label>
                  <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                      {getRoleLabel(profileData.role)}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full">
                      Standard Access
                    </span>
                  </div>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <RiCalendarLine className="h-4 w-4 text-gray-400" />
                    Account Created
                  </label>
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Joined </span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {formatDate(profileData.joinedDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Password & Security */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <RiLockPasswordLine className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Password & Security
                </h3>
                <button
                  onClick={() => setShowPasswordChange((prev) => !prev)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
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

              <div className="p-5 sm:p-6">
                {showPasswordChange ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwords.current}
                          onChange={(e) =>
                            setPasswords({ ...passwords, current: e.target.value })
                          }
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwords.new}
                          onChange={(e) =>
                            setPasswords({ ...passwords, new: e.target.value })
                          }
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                          placeholder={PASSWORD_EXAMPLE}
                          title={PASSWORD_EXAMPLE}
                        />
                        <p
                          className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 underline decoration-dotted cursor-help"
                          title={PASSWORD_EXAMPLE}
                        >
                          {PASSWORD_HINT}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) =>
                            setPasswords({ ...passwords, confirm: e.target.value })
                          }
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswords({ current: "", new: "", confirm: "" });
                        }}
                        className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {passwordLoading && (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        Update Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    For security reasons, use a strong password and avoid sharing
                    your account with others.
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <RiHistoryLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Recent Activity
                </h3>
              </div>
              <div className="p-5 sm:p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 text-sm pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                    >
                      <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {act.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
      </div>
    </div>
  );
};

export default Profile;