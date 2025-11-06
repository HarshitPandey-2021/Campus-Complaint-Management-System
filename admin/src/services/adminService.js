// src/services/adminService.js
import axios from "axios";

const API_URL = "http://localhost:4000/api/complaints";

/* =========================================================
   🧩 1. FETCH ALL COMPLAINTS (Admin) with Pagination
========================================================= */
export const getAllComplaints = async (token, page = 1, limit = 10) => {
  try {
    const res = await axios.get(`${API_URL}/admin/complaints`, {
      params: { page, limit }, // Add pagination params
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Returns paginated complaints
  } catch (err) {
    console.error("❌ Error fetching complaints:", err);
    return [];
  }
};


/* =========================================================
   📊 2. GET STATS (Admin)
========================================================= */
export const getStats = async (token) => {
  try {
    // ✅ Correct endpoint for admin analytics
    const res = await axios.get(`${API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // ✅ Flatten the backend response so frontend can use data.total, etc.
    const { stats, byCategory, byStatus, byPriority, avgResolutionTime, trend } = res.data;

    return {
      ...stats, // total, pending, resolved, inProgress, rejected
      byCategory,
      byStatus,
      byPriority,
      avgResolutionTime,
      trend,
    };
  } catch (error) {
    console.error("⚠️ Error fetching stats:", error);
    console.warn("Fallback: Using client-side stats calculation.");

    const complaints = await getAllComplaints(token);
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
      rejected: complaints.filter((c) => c.status === "Rejected").length,
      byCategory: [],
      byStatus: [],
      byPriority: [],
      avgResolutionTime: 0,
      trend: [],
    };
  }
};


/* =========================================================
   🔎 3. GET COMPLAINT BY ID
========================================================= */
export const getComplaintById = async (id, token) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching complaint:", error);
    throw error;
  }
};

/* =========================================================
   ✏️ 4. UPDATE COMPLAINT STATUS (Admin)
========================================================= */
export const updateComplaintStatus = async (id, newStatus, remarks = "", token) => {
  try {
    const res = await axios.put(
      `${API_URL}/admin/${id}`,
      {
        status: newStatus,
        adminRemarks: remarks,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error updating complaint:", error);
    throw error;
  }
};

/* =========================================================
   📅 5. FILTER COMPLAINTS (Client-side)
========================================================= */
export const filterComplaints = async (
  { status = "", search = "", dateRange = "all" },
  token
) => {
  const complaints = await getAllComplaints(token);
  let filtered = [...complaints];

  if (status && status !== "All") {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (search && search.trim() !== "") {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.subject?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        c.location?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
    );
  }

  if (dateRange && dateRange !== "all") {
    const now = new Date();
    let threshold = new Date();
    if (dateRange === "week") threshold.setDate(now.getDate() - 7);
    else if (dateRange === "month") threshold.setDate(now.getDate() - 30);
    filtered = filtered.filter((c) => new Date(c.submittedAt) >= threshold);
  }

  return filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
};

/* =========================================================
   📈 6. ANALYTICS HELPERS
========================================================= */

// Get complaint count by category
export const getComplaintsByCategory = async (token) => {
  const complaints = await getAllComplaints(token);
  const grouped = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  return grouped;
};

// Get complaint count by status
export const getComplaintsByStatus = async (token) => {
  const complaints = await getAllComplaints(token);
  const grouped = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  return grouped;
};

// Trend by submission date
export const getComplaintsTrend = async (token) => {
  const complaints = await getAllComplaints(token);
  const grouped = complaints.reduce((acc, c) => {
    const date = new Date(c.submittedAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return grouped;
};

// Distribution by priority
export const getPriorityDistribution = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.byPriority || {};
  } catch (error) {
    console.error("⚠️ Error fetching priority distribution:", error);
    return {};
  }
};


// Average resolution time (in hours)
export const getAverageResolutionTime = async (token) => {
  const complaints = await getAllComplaints(token);
  const resolved = complaints.filter((c) => c.status === "Resolved" && c.resolvedAt);
  if (resolved.length === 0) return 0;

  const totalTime = resolved.reduce((sum, c) => {
    const diff = new Date(c.resolvedAt) - new Date(c.submittedAt);
    return sum + diff;
  }, 0);

  return (totalTime / resolved.length / (1000 * 60 * 60)).toFixed(1); // ✅ hours (rounded)
};


/* =========================================================
   🔔 7. MARK COMPLAINT AS READ (Admin)
========================================================= */
export const markComplaintAsRead = async (id, token) => {
  try {
    const res = await axios.patch(
      `${API_URL}/admin/${id}/read`,
      { readByAdmin: true },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data; // Returning the updated complaint data
  } catch (error) {
    console.error("❌ Error marking complaint as read:", error);
    throw error;
  }
};


/* =========================================================
   🆕 8. FETCH UNREAD COMPLAINTS (New Notifications)
========================================================= */
export const getUnreadComplaints = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/admin/complaints`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Log the full response data to verify the fields
    console.log("Full Complaints Data:", res.data);

    // Filter complaints where admin hasn’t read yet
    const unread = res.data.filter((c) => !c.readByAdmin);
    return unread.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  } catch (error) {
    console.error("❌ Error fetching unread complaints:", error);
    return [];
  }
};



/* =========================================================
   🧹 9. MARK ALL COMPLAINTS AS READ (Optional Helper)
========================================================= */
export const markAllAsRead = async (token) => {
  try {
    const complaints = await getUnreadComplaints(token);
    await Promise.all(
      complaints.map((c) => markComplaintAsRead(c._id, token))
    );
    console.log(`✅ Marked ${complaints.length} complaints as read.`);
  } catch (error) {
    console.error("❌ Error marking all complaints as read:", error);
  }
};