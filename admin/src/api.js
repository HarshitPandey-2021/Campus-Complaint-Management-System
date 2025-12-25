// admin/src/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

// -------- Complaints (Admin) --------

// ✅ Fix: Backend route is /complaints (not /complaints/admin/all)
export async function getAllComplaints(token) {
  const res = await fetch(`${API_BASE}/complaints`, {
    headers: authHeaders(token),
  });
  const data = await handleResponse(res);
  
  // ✅ Transform: subject → title for frontend compatibility
  if (Array.isArray(data)) {
    return data.map(complaint => ({
      ...complaint,
      title: complaint.title || complaint.subject, // Backend uses 'subject'
      createdAt: complaint.createdAt || complaint.submittedAt,
    }));
  }
  return data;
}

export async function getComplaintById(id, token) {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: authHeaders(token),
  });
  const data = await handleResponse(res);
  
  // ✅ Transform for consistency
  return {
    ...data,
    title: data.title || data.subject,
    createdAt: data.createdAt || data.submittedAt,
  };
}

export async function updateComplaintStatus(
  id,
  status,
  token,
  adminRemarks,
  assignedTo
) {
  const body = { status };
  if (adminRemarks !== undefined) body.adminRemarks = adminRemarks;
  if (assignedTo !== undefined) body.assignedTo = assignedTo;

  const res = await fetch(`${API_BASE}/admin/complaints/${id}/status`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function markComplaintAsRead(id, token) {
  const res = await fetch(`${API_BASE}/admin/complaints/${id}/read`, {
    method: "PUT",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// -------- Stats/Analytics (Admin) --------

export async function getStats(token) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getComplaintsByCategory(token) {
  try {
    const stats = await getStats(token);
    const categories = stats.categories || [];
    const map = {};
    categories.forEach((c) => {
      map[c._id || "Unknown"] = c.count;
    });
    return map;
  } catch (err) {
    console.error("Error in getComplaintsByCategory:", err);
    return {};
  }
}

export async function getComplaintsByStatus(token) {
  try {
    const stats = await getStats(token);
    return {
      Pending: stats.pending || 0,
      "In Progress": stats.inProgress || 0,
      Resolved: stats.resolved || 0,
      Rejected: stats.rejected || 0,
    };
  } catch (err) {
    console.error("Error in getComplaintsByStatus:", err);
    return {};
  }
}

export async function getPriorityDistribution(token) {
  try {
    const stats = await getStats(token);
    const priorities = stats.priorities || [];
    const map = {};
    priorities.forEach((p) => {
      map[p._id || "Unknown"] = p.count;
    });
    return map;
  } catch (err) {
    console.error("Error in getPriorityDistribution:", err);
    return {};
  }
}

export async function getComplaintsTrend(token) {
  try {
    const stats = await getStats(token);
    return stats.trend || {};
  } catch (err) {
    console.error("Error in getComplaintsTrend:", err);
    return {};
  }
}

export async function getAverageResolutionTime(token) {
  try {
    const stats = await getStats(token);
    return stats.avgResolutionTime || 0;
  } catch (err) {
    console.error("Error in getAverageResolutionTime:", err);
    return 0;
  }
}

// -------- Activity Logs --------

export async function getAllLogs(token) {
  const res = await fetch(`${API_BASE}/admin/logs`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// -------- Profile --------

export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function updateProfile(data, token) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
