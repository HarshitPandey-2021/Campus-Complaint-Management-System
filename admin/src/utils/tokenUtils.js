// src/utils/tokenUtils.js
// Single source of truth for admin token + user session

// Decode JWT payload (no crypto verification, only convenience)
export function decodeToken(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}

// Get admin token from dedicated keys only
export function getAdminToken() {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("ccms-admin-token") ||
    null
  );
}

// Get admin user from cache or decode from token
export function getAdminUser() {
  // Preferred admin-specific keys
  const userKeys = [
    "ccms-admin-session",
    "adminUser",
    "adminProfile",
  ];

  for (const key of userKeys) {
    try {
      const userStr = localStorage.getItem(key);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.email) {
          return user;
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached admin user from key:", key, e);
    }
  }

  // Fallback: decode from token if nothing cached
  const token = getAdminToken();
  if (token) {
    try {
      const decoded = decodeToken(token);
      if (decoded && decoded.email) {
        return {
          // minimal shape from token
          name: decoded.name || decoded.email.split("@")[0],
          email: decoded.email,
          role: decoded.role,
          userId: decoded.userId,
        };
      }
    } catch (e) {
      console.warn("Token decode failed:", e.message);
    }
  }

  return null;
}

// Save admin session in dedicated keys
export function saveAdminSession(user, token) {
  if (!user || !token) return;

  const cleanUser = {
    name: user.name || user.email?.split("@")[0] || "Admin",
    email: user.email,
    role: user.role || "admin",
    userId: user.userId || user.id || user._id,
  };

  localStorage.setItem("adminToken", token);
  localStorage.setItem("ccms-admin-token", token);
  localStorage.setItem("ccms-admin-session", JSON.stringify(cleanUser));
  localStorage.setItem("adminUser", JSON.stringify(cleanUser));
  localStorage.setItem("adminProfile", JSON.stringify(cleanUser));
}

// Clear all admin-related tokens and caches
export function logoutAdmin() {
  try {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("ccms-admin-token");

    localStorage.removeItem("ccms-admin-session");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminProfile");
  } catch (e) {
    console.error("Failed to clear admin session", e);
  }
}

// Optional helper if needed in future
export function isAdminAuthenticated() {
  const token = getAdminToken();
  const user = getAdminUser();
  return !!token && !!user && (user.role === "admin" || user.role === "ADMIN");
}
