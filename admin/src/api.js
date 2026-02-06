// api.js
import {
  getAdminToken,
  getAdminRefreshToken,
  logoutAdmin,
} from "./utils/tokenUtils.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function isTokenExpired(token) {
  if (!token) return true;

  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;

    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const buffer = 5 * 60 * 1000;

    return expiryTime - now < buffer;
  } catch {
    return true;
  }
}

async function refreshAccessToken() {
  try {
    const refreshToken = getAdminRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      return data.token;
    }

    return null;
  } catch {
    logoutAdmin();
    window.location.href = "https://ccms-home.vercel.app/login";
    return null;
  }
}

async function getAuthHeaders() {
  let token = getAdminToken();

  if (isTokenExpired(token)) {
    token = await refreshAccessToken();
    if (!token) {
      return { "Content-Type": "application/json" };
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiCall(url, options = {}) {
  const headers = await getAuthHeaders();

  let res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      return res;
    }

    const retryHeaders = await getAuthHeaders();
    res = await fetch(url, {
      ...options,
      headers: { ...retryHeaders, ...(options.headers || {}) },
    });
  }

  return res;
}

async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// Complaints
export async function getAllComplaints() {
  try {
    let res = await apiCall(`${API_BASE}/complaints/admin/all`);
    if (res.status === 404) {
      res = await apiCall(`${API_BASE}/complaints`);
    }

    const data = await handleResponse(res);
    if (Array.isArray(data)) {
      return data.map((c) => ({
        ...c,
        title: c.title || c.subject || "Untitled",
        createdAt: c.createdAt || c.submittedAt,
      }));
    }

    return data;
  } catch {
    return [];
  }
}

export async function getUnreadComplaints() {
  try {
    const res = await apiCall(`${API_BASE}/complaints/admin/unread`);
    return handleResponse(res);
  } catch {
    return [];
  }
}

export async function getStats() {
  const res = await apiCall(`${API_BASE}/complaints/admin/analytics`);
  return handleResponse(res);
}

// ✅ YOUR ORIGINAL WORKING CODE - KEPT AS IS
export async function getComplaintById(id) {
  const routesToTry = [
    `${API_BASE}/complaints/admin/${id}`,
    `${API_BASE}/complaints/${id}`,
    `${API_BASE}/admin/complaints/${id}`,
    `${API_BASE}/complaints/details/${id}`,
  ];

  for (const route of routesToTry) {
    try {
      console.log(`🔍 Trying route: ${route}`);
      const res = await apiCall(route);
      const data = await handleResponse(res);
      console.log(`✅ Success with route: ${route}`);
      return data;
    } catch (error) {
      console.log(`❌ Failed route: ${route} - ${error.message}`);
    }
  }

  throw new Error('Complaint not found - all routes failed');
}

// ✅ FIXED: Update complaint STATUS (resolve, reject, start work)
export async function updateComplaintStatus(id, status, adminRemarks, assignedTo = null) {
  const body = { status };
  if (adminRemarks) body.adminRemarks = adminRemarks;
  if (assignedTo) body.assignedTo = assignedTo;

  // Try multiple routes (same pattern as getComplaintById)
  const routesToTry = [
    `${API_BASE}/complaints/admin/${id}/status`,
    `${API_BASE}/admin/complaints/${id}/status`,
  ];

  for (const route of routesToTry) {
    try {
      console.log(`🔍 Trying status update route: ${route}`);
      const res = await apiCall(route, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const data = await handleResponse(res);
      console.log(`✅ Status update success with route: ${route}`);
      return data;
    } catch (error) {
      console.log(`❌ Failed route: ${route} - ${error.message}`);
    }
  }

  throw new Error('Failed to update status - all routes failed');
}

// ✅ FIXED: Update complaint DETAILS (edit title, description, etc.)
export async function updateComplaint(id, updates) {
  // If only status is being updated, use status endpoint
  if (updates && Object.keys(updates).length === 1 && updates.status) {
    return updateComplaintStatus(id, updates.status);
  }

  // Try multiple routes for editing complaint details
  const routesToTry = [
    `${API_BASE}/complaints/admin/${id}`,
    `${API_BASE}/admin/complaints/${id}`,
    `${API_BASE}/complaints/${id}`,
  ];

  for (const route of routesToTry) {
    try {
      console.log(`🔍 Trying edit route: ${route}`);
      const res = await apiCall(route, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(res);
      console.log(`✅ Edit success with route: ${route}`);
      return data;
    } catch (error) {
      console.log(`❌ Failed route: ${route} - ${error.message}`);
    }
  }

  throw new Error('Failed to update complaint - all routes failed');
}

export async function markComplaintAsRead(id) {
  const res = await apiCall(`${API_BASE}/complaints/admin/${id}/read`, {
    method: "PATCH",
  });
  return handleResponse(res);
}

// Profile
export async function getProfile() {
  const res = await apiCall(`${API_BASE}/profile`);
  return handleResponse(res);
}

export async function updateProfile(data) {
  const res = await apiCall(`${API_BASE}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function changePassword(currentPassword, newPassword) {
  const res = await apiCall(`${API_BASE}/auth/change-password`, {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

// Departments
export async function getDepartments() {
  try {
    const res = await apiCall(`${API_BASE}/departments`);
    return handleResponse(res);
  } catch {
    return [];
  }
}

// Admin logs
export async function getAllLogs() {
  const res = await apiCall(`${API_BASE}/admin/logs`);
  return handleResponse(res);
}

export async function logout() {
  logoutAdmin();
}

const api = {
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
  logout,
};

export default api;