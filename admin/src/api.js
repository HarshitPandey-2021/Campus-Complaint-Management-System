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
    window.location.href = "http://localhost:5174/login";
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

export async function getComplaintById(id) {
  // Try multiple route patterns until one works
  const routesToTry = [
    `${API_BASE}/complaints/admin/${id}`,     // Current attempt
    `${API_BASE}/complaints/${id}`,          // Most common pattern
    `${API_BASE}/admin/complaints/${id}`,    // Alternative pattern
    `${API_BASE}/complaints/details/${id}`,  // Another possibility
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
      // Continue to next route
    }
  }

  // If all routes fail, throw error
  throw new Error('Complaint not found - all routes failed');
} 

export async function updateComplaintStatus(
  id,
  status,
  adminRemarks,
  assignedTo = null
) {
  const body = { status };
  if (adminRemarks) body.adminRemarks = adminRemarks;
  if (assignedTo) body.assignedTo = assignedTo;

  // const res = await apiCall(`${API_BASE}/complaints/admin/${id}/status`, { problem created because od reverse order (mismatch from the backend)
  const res = await apiCall(`${API_BASE}/admin/complaints/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function updateComplaint(id, updates) {
  if (updates && Object.keys(updates).length === 1 && updates.status) {
    return updateComplaintStatus(id, updates.status);
  }

  const res = await apiCall(`${API_BASE}/complaints/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
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
