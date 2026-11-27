// src/hooks/useComplaints.js
import { useState, useEffect } from "react";
import {
  getAllComplaints,
  createComplaint,
} from "../services/complaintService";

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await getAllComplaints();
      // Ensure latest complaints always appear on top
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const aTime = new Date(a.createdAt || a.updatedAt || a.date || 0).getTime();
            const bTime = new Date(b.createdAt || b.updatedAt || b.date || 0).getTime();

            if (aTime && bTime && aTime !== bTime) {
              return bTime - aTime;
            }

            // Fallback to id if timestamps are missing or equal
            const aId = typeof a.id === "number" ? a.id : parseInt(a.id || a._id || 0, 10) || 0;
            const bId = typeof b.id === "number" ? b.id : parseInt(b.id || b._id || 0, 10) || 0;
            return bId - aId;
          })
        : data;

      setComplaints(sorted);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const addComplaint = async (complaintData) => {
    try {
      await createComplaint(complaintData);
      // Reload from backend so the section auto-refreshes with correct ordering
      await fetchComplaints();
    } catch (err) {
      console.error("Error creating complaint:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return { complaints, loading, fetchComplaints, addComplaint };
};
