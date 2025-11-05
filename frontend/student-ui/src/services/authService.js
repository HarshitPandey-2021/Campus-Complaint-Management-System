// src/services/authService.js
import api from "./api";

export const loginUser = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const signupUser = async (userInfo) => {
  const { data } = await api.post("/auth/signup", userInfo);
  return data;
};

export const logoutUser = async () => {
  await api.post("/auth/logout");
};
