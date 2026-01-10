// user-portal/src/api.js - WITH AUTO-REFRESH
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Check if token is expired
function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    
    if (!payload.exp) return false;
    
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expiryTime < now + fiveMinutes;
  } catch (e) {
    console.error("Token expiry check failed:", e);
    return true;
  }
}

// Refresh access token
async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!refreshToken) {
      console.warn("⚠️ No refresh token available");
      return null;
    }

    console.log("🔄 Refreshing access token...");
    
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error("Refresh failed");
    }

    const data = await res.json();
    
    localStorage.setItem("token", data.token);
    console.log("✅ Access token refreshed");
    
    return data.token;
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    // Clear session and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "http://localhost:5174/login";
    return null;
  }
}

// Get auth headers with auto-refresh
async function getAuthHeaders() {
  let token = localStorage.getItem("token");
  
  if (isTokenExpired(token)) {
    console.warn("⚠️ Token expired or expiring, refreshing...");
    token = await refreshAccessToken();
  }
  
  if (!token) {
    console.error("❌ No valid user token");
    return { "Content-Type": "application/json" };
  }
  
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// API call wrapper with retry
async function apiCall(url, options = {}) {
  let headers = await getAuthHeaders();
  let res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    console.warn("⚠️ 401 received, attempting token refresh...");
    
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      headers = await getAuthHeaders();
      res = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
    }
  }

  return res;
}

// Handle responses
async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({
      message: `Request failed with status ${res.status}`,
    }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ==================== AUTH API ====================

export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("login error:", error);
    throw error;
  }
}

export async function register(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("register error:", error);
    throw error;
  }
}

// ==================== PROFILE API ====================

export async function getProfile() {
  try {
    const res = await apiCall(`${API_BASE}/profile`);
    return await handleResponse(res);
  } catch (error) {
    console.error("getProfile error:", error);
    return null;
  }
}

export async function updateProfile(data) {
  try {
    const res = await apiCall(`${API_BASE}/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("updateProfile error:", error);
    throw error;
  }
}

export async function getMyStats() {
  try {
    const res = await apiCall(`${API_BASE}/profile/stats`);
    return await handleResponse(res);
  } catch (error) {
    console.error("getMyStats error:", error);
    return { total: 0, pending: 0, inProgress: 0, resolved: 0 };
  }
}

// ==================== COMPLAINTS API ====================

export async function getMyComplaints() {
  try {
    const res = await apiCall(`${API_BASE}/complaints/mine`);
    return await handleResponse(res);
  } catch (error) {
    console.error("getMyComplaints error:", error);
    return [];
  }
}

export async function getComplaintById(id) {
  try {
    const res = await apiCall(`${API_BASE}/complaints/${id}`);
    return await handleResponse(res);
  } catch (error) {
    console.error("getComplaintById error:", error);
    return null;
  }
}

export async function submitComplaintWithFiles(formData) {
  try {
    const token = localStorage.getItem("token");
    
    if (isTokenExpired(token)) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Authentication failed");
    }
    
    const currentToken = localStorage.getItem("token");
    
    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
      body: formData,
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("submitComplaintWithFiles error:", error);
    throw error;
  }
}

export const submitComplaint = submitComplaintWithFiles;

export async function updateComplaint(id, formData) {
  try {
    const token = localStorage.getItem("token");
    
    if (isTokenExpired(token)) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Authentication failed");
    }
    
    const currentToken = localStorage.getItem("token");
    
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
      body: formData,
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("updateComplaint error:", error);
    throw error;
  }
}

// ==================== DEPARTMENTS API ====================

export async function getDepartments() {
  try {
    const res = await apiCall(`${API_BASE}/departments`);
    return await handleResponse(res);
  } catch (error) {
    console.error("getDepartments error:", error);
    return [];
  }
}

// ==================== PDF HELPERS ====================

export function getViewablePdfUrl(url) {
  if (!url) return null;
  if (url.includes("raw/upload")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
}

export async function viewPdf(url) {
  if (!url) throw new Error("No PDF URL provided");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");
    
    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
    return blobUrl;
  } catch (error) {
    console.error("viewPdf error:", error);
    const viewerUrl = getViewablePdfUrl(url);
    if (viewerUrl !== url) {
      window.open(viewerUrl, "_blank");
      return viewerUrl;
    }
    throw error;
  }
}

export async function downloadPdf(url, filename = "document.pdf") {
  if (!url) throw new Error("No PDF URL provided");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");
    
    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    return true;
  } catch (error) {
    console.error("downloadPdf error:", error);
    throw error;
  }
}

const api = {
  login,
  register,
  getProfile,
  updateProfile,
  getMyStats,
  getMyComplaints,
  getComplaintById,
  submitComplaintWithFiles,
  submitComplaint,
  updateComplaint,
  getDepartments,
  getViewablePdfUrl,
  viewPdf,
  downloadPdf,
};

export default api;
