// src/utils/tokenUtils.js - ADMIN TOKEN HELPERS (single source of truth)

// Decode JWT payload safely
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

// Get admin token from any known key
export function getAdminToken() {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    null
  );
}

// Get admin user from cache or token
export function getAdminUser() {
  console.log("🔍 getAdminUser() - checking caches...");

  // 1) Try all possible cached user keys
  const userKeys = [
    "user",
    "adminProfile",
    "profile",
    "adminUser",
    "ccms-admin-session",
  ];

  for (const key of userKeys) {
    try {
      const userStr = localStorage.getItem(key);
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log(`✅ Found in ${key}:`, user.email);
        return user;
      }
    } catch (e) {
      console.warn(`Failed to parse ${key}:`, e.message);
    }
  }

  // 2) Decode from any available token
  const token = getAdminToken();
  if (token) {
    console.log("🔍 Decoding token...");
    try {
      const decoded = decodeToken(token);
      if (decoded) {
        console.log("✅ Token decoded:", decoded.email);
        return decoded;
      }
    } catch (e) {
      console.warn("Token decode failed:", e.message);
    }
  }

  console.warn("⚠️ No admin data found - using fallback");
  return null;
}

// Save admin session in all compatible keys
export function saveAdminSession(user, token = null) {
  if (!user) return;
  console.log("💾 Caching admin session:", user.email);

  if (token) {
    localStorage.setItem("adminToken", token);
  }

  // Cache in all formats for compatibility
  localStorage.setItem("adminProfile", JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("ccms-admin-session", JSON.stringify(user));

  console.log("✅ Admin session cached everywhere");
}

// Clear all admin-related tokens and caches
export function logoutAdmin() {
  console.log("🚪 Logging out admin...");

  localStorage.removeItem("adminToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");

  localStorage.removeItem("user");
  localStorage.removeItem("adminProfile");
  localStorage.removeItem("ccms-admin-session");
  localStorage.removeItem("profile");
  localStorage.removeItem("adminUser");
}
