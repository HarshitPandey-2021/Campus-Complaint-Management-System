// src/api.js - ADMIN PORTAL API

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ==================== HELPERS ====================

// Attach Authorization header with Bearer token
function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Handle API response and throw proper error messages
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

// ==================== COMPLAINTS (ADMIN) ====================

// Get all complaints (admin sees all, student sees own only - backend handles role)
export async function getAllComplaints(token) {
  console.log("📦 Fetching all complaints");

  const res = await fetch(`${API_BASE}/complaints`, {
    headers: authHeaders(token),
  });

  const data = await handleResponse(res);

  if (Array.isArray(data)) {
    console.log(`✅ Loaded ${data.length} REAL complaints from DB`);
    return data.map((complaint) => ({
      ...complaint,
      title:
        complaint.title ||
        complaint.subject ||
        complaint.complaintId ||
        "Untitled",
      createdAt: complaint.createdAt || complaint.submittedAt,
      status: complaint.status || complaint.Status || "Pending",
      category: complaint.category || complaint.department || "General",
    }));
  }

  return data || [];
}

// Get one complaint by ID
export async function getComplaintById(id, token) {
  console.log("📄 Fetching complaint:", id);

  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: authHeaders(token),
  });

  const data = await handleResponse(res);

  return {
    ...data,
    title: data.title || data.subject,
    createdAt: data.createdAt || data.submittedAt,
  };
}

// Update complaint (title, description, category, priority, location)
export async function updateComplaint(id, updateData, token) {
  console.log("🔄 Updating complaint:", id, updateData);

  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  return handleResponse(res);
}

// Update complaint status / remarks / assignment
export async function updateComplaintStatus(
  id,
  status,
  token,
  adminRemarks = "",
  assignedTo = null
) {
  const body = { status };
  if (adminRemarks) body.adminRemarks = adminRemarks;
  if (assignedTo) body.assignedTo = assignedTo;

  console.log("🔄 Updating status:", { id, status, adminRemarks, assignedTo });

  // Backend route: PUT /api/admin/complaints/:id/status
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

// Mark complaint as read (for notification panel)
export async function markComplaintAsRead(id, token) {
  console.log("📖 Marking as read:", id);

  // Backend route: PATCH /api/complaints/admin/:id/read
  const res = await fetch(`${API_BASE}/complaints/admin/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

// ==================== STATS / ANALYTICS ====================

// ✅ FIXED: Get analytics stats from backend with categories & priorities
export async function getStats(token) {
  console.log("📊 Fetching analytics from BACKEND...");

  try {
    // Call backend analytics endpoint
    const res = await fetch(`${API_BASE}/complaints/admin/analytics`, {
      headers: authHeaders(token),
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await handleResponse(res);
    console.log("✅ Backend Analytics Response:", data);

    // ✅ Return complete data structure with categories and priorities
    return {
      // Basic stats
      stats: data.stats || {
        total: data.total || 0,
        pending: data.pending || 0,
        inProgress: data.inProgress || 0,
        resolved: data.resolved || 0,
        rejected: data.rejected || 0,
      },
      
      // Average resolution time
      avgResolutionTime: data.avgResolutionTime || 0,
      
      // ✅ Categories array from backend aggregation
      categories: data.categories || [],
      
      // ✅ Priorities array from backend aggregation
      priorities: data.priorities || [],
      
      // Priority breakdown object
      byPriority: data.byPriority || {
        High: 0,
        Medium: 0,
        Low: 0,
      },
    };

  } catch (error) {
    console.error("❌ Backend analytics failed:", error);
    
    // ✅ Fallback: Calculate from complaints if backend fails
    console.warn("⚠️ Using fallback calculation from complaints");
    
    try {
      const complaints = await getAllComplaints(token);
      return calculateStatsFromComplaints(complaints);
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      
      // Return empty structure
      return {
        stats: {
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          rejected: 0,
        },
        avgResolutionTime: 0,
        categories: [],
        priorities: [],
        byPriority: { High: 0, Medium: 0, Low: 0 },
      };
    }
  }
}

// ✅ Fallback: Calculate stats from complaints array (client-side)
export const calculateStatsFromComplaints = (complaints) => {
  console.log(`📊 Client-side calculation from ${complaints.length} complaints`);

  const stats = {
    total: complaints.length,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  };

  const priorityCounts = { High: 0, Medium: 0, Low: 0 };
  const categoryCounts = {};

  complaints.forEach((complaint) => {
    // Count by status
    const status = (complaint.status || "Pending").toLowerCase().trim();
    
    if (status.includes("pending") || status === "new") {
      stats.pending++;
    } else if (status.includes("progress") || status.includes("process")) {
      stats.inProgress++;
    } else if (status.includes("resolved") || status.includes("complete")) {
      stats.resolved++;
    } else if (status.includes("reject") || status.includes("close")) {
      stats.rejected++;
    }

    // Count by priority
    const priority = (complaint.priority || "Medium").trim();
    if (priority === "High" || priority === "HIGH") {
      priorityCounts.High++;
    } else if (priority === "Medium" || priority === "MEDIUM") {
      priorityCounts.Medium++;
    } else if (priority === "Low" || priority === "LOW") {
      priorityCounts.Low++;
    }

    // Count by category
    const category = complaint.category || "Other";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  // Convert category counts to array format
  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ _id: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Convert priority counts to array format
  const priorities = Object.entries(priorityCounts)
    .map(([name, count]) => ({ _id: name, count }))
    .filter(p => p.count > 0);

  console.log("✅ Client-side stats calculated:", {
    stats,
    categories: categories.length,
    priorities: priorities.length,
  });

  return {
    stats,
    avgResolutionTime: 0,
    categories,
    priorities,
    byPriority: priorityCounts,
  };
};

// ==================== ACTIVITY LOGS ====================

// Fetch admin logs from backend (separate from frontend local activity logs)
export async function getAllLogs(token) {
  console.log("📋 Fetching admin logs");

  // Backend route: GET /api/admin/logs
  const res = await fetch(`${API_BASE}/admin/logs`, {
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

// ==================== PROFILE ====================

// Get admin profile (same /api/profile as student, backend uses JWT)
export async function getProfile(token) {
  console.log("👤 Fetching profile");

  const res = await fetch(`${API_BASE}/profile`, {
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

// Update admin profile (name / phone etc. as allowed by backend)
export async function updateProfile(data, token) {
  console.log("✏️ Updating profile", data);

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

// Change password (current + new)
export async function changePassword(data, token) {
  console.log("🔐 Changing password");

  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

// ==================== DEPARTMENTS ====================

// Get department list for filters / assignment
export async function getDepartments(token) {
  console.log("🏢 Fetching departments");

  const res = await fetch(`${API_BASE}/departments`, {
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

// ==================== UNREAD NOTIFICATIONS ====================

// Get unread complaints for notification badge
export async function getUnreadComplaints(token) {
  console.log("🔔 Fetching unread complaints");

  try {
    // Backend route: GET /api/complaints/admin/unread
    const res = await fetch(`${API_BASE}/complaints/admin/unread`, {
      headers: authHeaders(token),
    });

    const data = await handleResponse(res);
    console.log(`✅ ${data.length} unread complaints`);
    return data;
  } catch (error) {
    console.warn("⚠️ Unread API failed → Using recent complaints", error);

    // Fallback: take top 10 recent complaints as "unread"
    const all = await getAllComplaints(token);
    return all.slice(0, 10);
  }
}
