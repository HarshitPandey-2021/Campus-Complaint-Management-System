// src/services/complaintService.js
import api from "./api";

export const getAllComplaints = async () => {
  const { data } = await api.get("/complaints");
  return data;
};

export const getComplaintById = async (id) => {
  const { data } = await api.get(`/complaints/${id}`);
  return data;
};

export const createComplaint = async (complaintData) => {
  const { data } = await api.post("/complaints", complaintData);
  return data;
};

export const updateComplaintStatus = async (id, status) => {
  const { data } = await api.patch(`/complaints/${id}`, { status });
  return data;
};
