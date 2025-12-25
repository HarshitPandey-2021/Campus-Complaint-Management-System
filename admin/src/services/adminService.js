// src/services/adminService.js

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

/* 1. FETCH ALL COMPLAINTS (Admin) */
export const getAllComplaints = async (token) => {
  try {
    const res = await axios.get(
      `${API_BASE}/complaints/admin/all`,
      authHeaders(token)
    );
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching complaints:", err);
    return [];
  }
};

/* 2. GET STATS (Admin analytics) */
export const getStats = async (token) => {
  try {
    const res = await axios.get(
      `${API_BASE}/complaints/admin/analytics`,
      authHeaders(token)
    );
    const { stats, byPriority, avgResolutionTime } = res.data;
    return {
      total: stats.total,
      pending: stats.pending,
      inProgress: stats.inProgress,
      resolved: stats.resolved,
      rejected: stats.rejected,
      byPriority,
      avgResolutionTime,
    };
  } catch (error) {
    console.error("⚠️ Error fetching stats:", error);
    const complaints = await getAllComplaints(token);
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
      rejected: complaints.filter((c) => c.status === "Rejected").length,
      byPriority: {},
      avgResolutionTime: 0,
    };
  }
};

/* 3. GET COMPLAINT BY ID (Admin) */
export const getComplaintById = async (id, token) => {
  try {
    const res = await axios.get(
      `${API_BASE}/complaints/admin/${id}`,
      authHeaders(token)
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching complaint:", error);
    throw error;
  }
};

/* 4. UPDATE COMPLAINT STATUS (Admin) */
export const updateComplaintStatus = async (
  id,
  newStatus,
  remarks = "",
  token,
  assignedTo
) => {
  try {
    const body = {
      status: newStatus,
      adminRemarks: remarks,
    };
    if (assignedTo) body.assignedTo = assignedTo;

    const res = await axios.put(
      `${API_BASE}/complaints/admin/${id}/status`,
      body,
      authHeaders(token)
    );
    return res.data; // { message: "Complaint updated successfully" }
  } catch (error) {
    console.error("❌ Error updating complaint:", error);
    throw error;
  }
};

/* 5. MARK COMPLAINT AS READ (Admin) */
export const markComplaintAsRead = async (id, token) => {
  try {
    const res = await axios.patch(
      `${API_BASE}/complaints/admin/${id}/read`,
      {},
      authHeaders(token)
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error marking complaint as read:", error);
    throw error;
  }
};

/* 6. FETCH UNREAD COMPLAINTS (Notifications) */
export const getUnreadComplaints = async (token) => {
  try {
    const all = await getAllComplaints(token);
    const unread = all.filter((c) => !c.readByAdmin);
    return unread.sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    );
  } catch (error) {
    console.error("❌ Error fetching unread complaints:", error);
    return [];
  }
};
