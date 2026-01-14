// user-portal/src/api.js
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
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      return data.token;
    }
    return null;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "http://localhost:5174/login";
    return null;
  }
}

async function getAuthHeaders() {
  let token = localStorage.getItem("token");

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
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      return res;
    }
    const retryHeaders = await getAuthHeaders();
    return fetch(url, {
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
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "student" }),
  });
  return handleResponse(res);
}

export async function register(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function getProfile() {
  try {
    const res = await apiCall(`${API_BASE}/profile`);
    return handleResponse(res);
  } catch {
    return null;
  }
}

export async function updateProfile(data) {
  const res = await apiCall(`${API_BASE}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function changePassword(currentPassword, newPassword) {
  try {
    let token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Authentication failed");
    }

    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    return handleResponse(res);
  } catch (error) {
    throw error;
  }
}

export async function getMyStats() {
  try {
    const res = await apiCall(`${API_BASE}/profile/stats`);
    return handleResponse(res);
  } catch {
    return { total: 0, pending: 0, inProgress: 0, resolved: 0 };
  }
}

export async function getMyComplaints() {
  try {
    const res = await apiCall(`${API_BASE}/complaints/mine`);
    return handleResponse(res);
  } catch {
    return [];
  }
}

export async function getComplaintById(id) {
  try {
    const res = await apiCall(`${API_BASE}/complaints/${id}`);
    return handleResponse(res);
  } catch {
    return null;
  }
}

export async function submitComplaintWithFiles(formData) {
  try {
    let token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Authentication failed");
    }

    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(res);
  } catch (error) {
    throw error;
  }
}

export const submitComplaint = submitComplaintWithFiles;

export async function updateComplaint(id, formData) {
  try {
    let token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Authentication failed");
    }

    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(res);
  } catch (error) {
    throw error;
  }
}

export async function getDepartments() {
  try {
    const res = await apiCall(`${API_BASE}/departments`);
    return handleResponse(res);
  } catch {
    return [];
  }
}

export function getViewablePdfUrl(url) {
  if (!url) return null;
  if (url.includes("raw/upload")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
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
    const viewerUrl = getViewablePdfUrl(url);
    if (viewerUrl && viewerUrl !== url) {
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

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);

    return true;
  } catch (error) {
    throw error;
  }
}

const api = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
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
