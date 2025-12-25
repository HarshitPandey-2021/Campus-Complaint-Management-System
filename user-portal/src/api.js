// src/api.js  (User / Student portal)

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ============================================
// PDF HELPER FUNCTIONS
// ============================================

// Get viewable PDF URL (uses Google Docs viewer for raw Cloudinary URLs)
export function getViewablePdfUrl(url) {
  if (!url) return null;

  // If it's a raw cloudinary URL, use Google Docs viewer
  if (url.includes("/raw/upload/")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
  }

  return url;
}

// View PDF in new tab (converts to blob first - works for any URL)
export async function viewPdf(url) {
  if (!url) {
    throw new Error("No PDF URL provided");
  }

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
    // Fallback: try Google Docs viewer
    const viewerUrl = getViewablePdfUrl(url);
    if (viewerUrl !== url) {
      window.open(viewerUrl, "_blank");
      return viewerUrl;
    }
    throw error;
  }
}

// Download PDF as file
export async function downloadPdf(url, filename = "document.pdf") {
  if (!url) {
    throw new Error("No PDF URL provided");
  }

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

    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);

    return true;
  } catch (error) {
    console.error("downloadPdf error:", error);
    throw error;
  }
}

// ============================================
// API HELPER FUNCTIONS
// ============================================

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.message || `Request failed with status ${res.status}`
    );
  }
  return res.json();
}

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// ============================================
// AUTH API
// ============================================

// Login (student app me reuse ho sakta hai)
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

// Register
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

// ============================================
// PROFILE API
// ============================================

export async function getProfile(token) {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("getProfile error:", error);
    return null;
  }
}

export async function updateProfile(data, token) {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("updateProfile error:", error);
    throw error;
  }
}

export async function getMyStats(token) {
  try {
    const res = await fetch(`${API_BASE}/profile/stats`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("getMyStats error:", error);
    return { total: 0, pending: 0, inProgress: 0, resolved: 0 };
  }
}

// ============================================
// COMPLAINTS API
// ============================================

export async function getMyComplaints(token) {
  try {
    const res = await fetch(`${API_BASE}/complaints/mine`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("getMyComplaints error:", error);
    return [];
  }
}

export async function getComplaintById(id, token) {
  try {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("getComplaintById error:", error);
    return null;
  }
}

// Submit complaint with files (FormData)
export async function submitComplaintWithFiles(formData, token) {
  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: formData,
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("submitComplaintWithFiles error:", error);
    throw error;
  }
}

// Alias for backward compatibility
export const submitComplaint = submitComplaintWithFiles;

// Update complaint with files (FormData)
export async function updateComplaint(id, formData, token) {
  try {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: formData,
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("updateComplaint error:", error);
    throw error;
  }
}

// Get complaints by status
export async function getComplaintsByStatus(status, token) {
  try {
    const res = await fetch(`${API_BASE}/complaints/status/${status}`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("getComplaintsByStatus error:", error);
    return [];
  }
}

// Search complaints
export async function searchComplaints(query, token) {
  try {
    const res = await fetch(
      `${API_BASE}/complaints/search?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return await handleResponse(res);
  } catch (error) {
    console.error("searchComplaints error:", error);
    return [];
  }
}

// ============================================
// DEPARTMENTS API
// ============================================

export async function getDepartments(token) {
  try {
    const res = await fetch(`${API_BASE}/departments`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("getDepartments error:", error);
    return [];
  }
}

// ============================================
// UTILITY FUNCTIONS
// ==========================================
export async function testConnection() {
  try {
    const base = API_BASE.endsWith("/api")
      ? API_BASE.slice(0, -4)
      : API_BASE.replace("/api", "");
    const res = await fetch(`${base}/health`);
    return await res.json();
  } catch (error) {
    console.error("testConnection error:", error);
    return { ok: false, error: error.message };
  }
}export async function testCloudinary() {
  try {
    const res = await fetch(`${API_BASE}/test-cloudinary`);
    return await handleResponse(res);
  } catch (error) {
    console.error("testCloudinary error:", error);
    return { status: "error", message: error.message };
  }
}

// ============================================
// DEFAULT EXPORT
// ============================================

const api = {
  // Auth
  login,
  register,

  // Profile
  getProfile,
  updateProfile,
  getMyStats,

  // Complaints
  getMyComplaints,
  getComplaintById,
  submitComplaintWithFiles,
  submitComplaint,
  updateComplaint,
  getComplaintsByStatus,
  searchComplaints,

  // Departments
  getDepartments,

  // PDF Helpers
  getViewablePdfUrl,
  viewPdf,
  downloadPdf,

  // Utilities
  testConnection,
  testCloudinary,
};

export default api;
