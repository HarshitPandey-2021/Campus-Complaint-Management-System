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
      setComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const addComplaint = async (complaintData) => {
    try {
      const newComplaint = await createComplaint(complaintData);
      setComplaints((prev) => [...prev, newComplaint]);
    } catch (err) {
      console.error("Error creating complaint:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return { complaints, loading, fetchComplaints, addComplaint };
};
