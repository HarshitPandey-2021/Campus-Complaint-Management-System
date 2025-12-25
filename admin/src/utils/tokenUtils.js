// src/utils/tokenUtils.js

export function decodeToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}

export function getAdminUser() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (user) {
    try {
      return JSON.parse(user);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }

  if (token) {
    const decoded = decodeToken(token);
    return decoded || null;
  }

  return null;
}

export function getAdminToken() {
  return localStorage.getItem("token");
}

export function logoutAdmin() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
