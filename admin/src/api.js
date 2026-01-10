// admin/src/api.js - COMPLETE WITH FALLBACK FOR 404

import { getAdminToken, saveAdminSession, logoutAdmin } from "./utils/tokenUtils";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Check if token is expired or expiring soon (5 min buffer)
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return expiryTime - now < fiveMinutes;
  } catch (e) {
    console.error("Token expiry check failed:", e);
    return true;
  }
}

// Refresh access token using refresh token
async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem("adminRefreshToken");
    if (!refreshToken) {
      console.warn("No refresh token available");
      return null;
    }

    console.log("🔄 Refreshing access token...");
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    localStorage.setItem("adminToken", data.token);
    console.log("✅ Access token refreshed");
    return data.token;
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    logoutAdmin();
    window.location.href = "/login";
    return null;
  }
}

// Get auth headers with auto-refresh
async function getAuthHeaders() {
  let token = getAdminToken();

  if (isTokenExpired(token)) {
    console.warn("⚠️ Token expired or expiring, refreshing...");
    token = await refreshAccessToken();
  }

  if (!token) {
    console.error("❌ No valid admin token");
    return { "Content-Type": "application/json" };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// API call wrapper with retry on 401
async function apiCall(url, options = {}) {
  let headers = await getAuthHeaders();
  let res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (res.status === 401) {
    console.warn("⚠️ 401 received, attempting token refresh...");
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers = await getAuthHeaders();
      res = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });
    } else {
      logoutAdmin();
      window.location.href = "/login";
    }
  }

  return res;
}

// Handle API responses
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({
      message: `Request failed with status ${res.status}`,
    }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ✅ FIXED: Get all complaints with fallback
export async function getAllComplaints() {
  console.log("📦 Fetching all complaints (admin)");
  try {
    // Try primary endpoint first
    let res = await apiCall(`${API_BASE}/complaints/admin/all`);
    
    // ✅ If 404, try fallback endpoint
    if (res.status === 404) {
      console.warn("⚠️ /admin/all not found, trying fallback /complaints");
      res = await apiCall(`${API_BASE}/complaints`);
    }

    const data = await handleResponse(res);

    if (Array.isArray(data)) {
      console.log(`✅ Loaded ${data.length} complaints`);
      return data.map((c) => ({
        ...c,
        title: c.title || c.subject || "Untitled",
        createdAt: c.createdAt || c.submittedAt,
      }));
    }
    return data;
  } catch (error) {
    console.error("❌ getAllComplaints error:", error);
    // ✅ Return empty array instead of throwing to prevent crash
    return [];
  }
}

// Get unread complaints
export async function getUnreadComplaints() {
  console.log("🔔 Fetching unread complaints");
  try {
    const res = await apiCall(`${API_BASE}/complaints/admin/unread`);
    return await handleResponse(res);
  } catch (error) {
    console.warn("⚠️ Unread API failed:", error);
    return [];
  }
}

// Get analytics/stats
export async function getStats() {
  console.log("📊 Fetching analytics");
  try {
    const res = await apiCall(`${API_BASE}/complaints/admin/analytics`);
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ getStats error:", error);
    throw error;
  }
}

// Get complaint by ID
export async function getComplaintById(id) {
  console.log("🔍 Fetching complaint:", id);
  try {
    const res = await apiCall(`${API_BASE}/complaints/admin/${id}`);
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ getComplaintById error:", error);
    throw error;
  }
}

// Update complaint status
export async function updateComplaintStatus(id, status, adminRemarks = "", assignedTo = null) {
  console.log("✏️ Updating status:", id, status);
  try {
    const body = { status };
    if (adminRemarks) body.adminRemarks = adminRemarks;
    if (assignedTo) body.assignedTo = assignedTo;

    const res = await apiCall(`${API_BASE}/complaints/admin/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return await handleResponse(res);
  } catch (error) {
    console.error("❌ updateComplaintStatus error:", error);
    throw error;
  }
}

// Update complaint (generic update)
export async function updateComplaint(id, updates) {
  console.log("✏️ Updating complaint:", id, updates);
  try {
    if (Object.keys(updates).length === 1 && updates.status) {
      return await updateComplaintStatus(id, updates.status);
    }

    const res = await apiCall(`${API_BASE}/complaints/admin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    return await handleResponse(res);
  } catch (error) {
    console.error("❌ updateComplaint error:", error);
    throw error;
  }
}

// Mark complaint as read
export async function markComplaintAsRead(id) {
  console.log("👁️ Marking as read:", id);
  try {
    const res = await apiCall(`${API_BASE}/complaints/admin/${id}/read`, {
      method: "PATCH",
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ markComplaintAsRead error:", error);
    throw error;
  }
}

// Get profile
export async function getProfile() {
  console.log("👤 Fetching profile");
  try {
    const res = await apiCall(`${API_BASE}/profile`);
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ getProfile error:", error);
    throw error;
  }
}

// Update profile
export async function updateProfile(data) {
  console.log("✏️ Updating profile");
  try {
    const res = await apiCall(`${API_BASE}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ updateProfile error:", error);
    throw error;
  }
}

// Change password
export async function changePassword(currentPassword, newPassword) {
  console.log("🔐 Changing password");
  try {
    const res = await apiCall(`${API_BASE}/auth/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ changePassword error:", error);
    throw error;
  }
}

// Get departments
export async function getDepartments() {
  console.log("🏢 Fetching departments");
  try {
    const res = await apiCall(`${API_BASE}/departments`);
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ getDepartments error:", error);
    return [];
  }
}

// Get admin logs
export async function getAllLogs() {
  console.log("📋 Fetching admin logs");
  try {
    const res = await apiCall(`${API_BASE}/admin/logs`);
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ getAllLogs error:", error);
    throw error;
  }
}

// Aliases for compatibility
export async function fetchAllComplaints() {
  return getAllComplaints();
}

export async function fetchComplaintById(id) {
  return getComplaintById(id);
}

export async function fetchComplaintAnalytics() {
  return getStats();
}

// Logout
export function logout() {
  logoutAdmin();
}

// Default export
export default {
  getAllComplaints,
  getUnreadComplaints,
  getStats,
  getComplaintById,
  updateComplaintStatus,
  updateComplaint,
  markComplaintAsRead,
  getProfile,
  updateProfile,
  changePassword,
  getDepartments,
  getAllLogs,
  fetchAllComplaints,
  fetchComplaintById,
  fetchComplaintAnalytics,
  logout,
};
