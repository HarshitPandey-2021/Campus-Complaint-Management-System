// src/utils/tokenUtils.js (admin frontend)

// LocalStorage keys used for admin auth/session
const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_REFRESH_KEY = "adminRefreshToken";
const ADMIN_SESSION_KEY = "ccms-admin-session";

/**
 * Save admin auth session after successful login.
 * Expects:
 *  - token: access JWT
 *  - refreshToken: optional refresh JWT
 *  - user: object with at least { id, name, email, role }
 */
export function saveAdminSession(token, refreshToken, user) {
  if (!token || !user) return;

  // Store access token
  localStorage.setItem(ADMIN_TOKEN_KEY, token);

  // Store refresh token if provided
  if (refreshToken) {
    localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken);
  }

  // Store minimal admin user info
  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  );
}

/**
 * Get stored admin access token (or null if missing).
 */
export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || null;
}

/**
 * Get stored admin refresh token (or null if missing).
 */
export function getAdminRefreshToken() {
  return localStorage.getItem(ADMIN_REFRESH_KEY) || null;
}

/**
 * Get stored admin user object (or null if missing/invalid).
 */
export function getAdminUser() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear admin session completely (logout helper).
 */
export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
}
