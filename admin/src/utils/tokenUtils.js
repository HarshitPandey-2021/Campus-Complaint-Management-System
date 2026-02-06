// src/utils/tokenUtils.js - FIXED VERSION

const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_REFRESH_KEY = "adminRefreshToken";
const ADMIN_SESSION_KEY = "ccms-admin-session";

export function saveAdminSession(user, token, refreshToken) {
  if (!token || !user) return;

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken);
  }

  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      userId: user.userId || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  );
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || null;
}

export function getAdminRefreshToken() {
  return localStorage.getItem(ADMIN_REFRESH_KEY) || null;
}

export function getAdminUser() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ✅ Get dynamic home URL
export const getHomeURL = () => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  return isLocalhost 
    ? 'http://localhost:5174'
    : 'https://ccms-home.vercel.app/';
};

// ✅ FIXED: Use dynamic URL
export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.replace(getHomeURL()); // ✅ Use dynamic URL
}