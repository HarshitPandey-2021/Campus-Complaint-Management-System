// src/utils/tokenUtils.js - COMPLETE REAL ADMIN FIX
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

export function getAdminToken() {
  // ✅ TRY ALL possible token keys (priority order)
  return localStorage.getItem('adminToken') ||
         localStorage.getItem('token') ||
         localStorage.getItem('authToken') || 
         null;
}

export function getAdminUser() {
  console.log('🔍 getAdminUser() - checking caches...');
  
  // ✅ 1. TRY ALL user caches first
  const userKeys = ['user', 'adminProfile', 'profile', 'adminUser', 'ccms-admin-session'];
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

  // ✅ 2. Decode from ANY available token
  const token = getAdminToken();
  if (token) {
    console.log('🔍 Decoding token...');
    try {
      const decoded = decodeToken(token);
      if (decoded) {
        console.log('✅ Token decoded:', decoded.email);
        return decoded;
      }
    } catch (e) {
      console.warn('Token decode failed:', e.message);
    }
  }

  console.warn('⚠️ No admin data found - using fallback');
  return null;
}

export function saveAdminSession(user, token = null) {
  console.log('💾 Caching admin session:', user.email);
  
  if (token) {
    localStorage.setItem('adminToken', token);
  }
  
  // Cache in ALL formats for compatibility
  localStorage.setItem('adminProfile', JSON.stringify(user));
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('ccms-admin-session', JSON.stringify(user));
  
  console.log('✅ Admin session cached everywhere');
}

export function logoutAdmin() {
  console.log('🚪 Logging out admin...');
  localStorage.removeItem("adminToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("adminProfile");
  localStorage.removeItem("ccms-admin-session");
  localStorage.removeItem("profile");
  localStorage.removeItem("adminUser");
}
