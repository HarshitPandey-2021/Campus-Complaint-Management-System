// src/utils/tokenUtils.js

export function saveAdminSession(user, token) {
  if (!user || !token) return;

  const cleanUser = {
    name: user.name || user.email?.split("@")[0] || "Admin",
    email: user.email,
    role: user.role || "admin",
    userId: user._id || user.id,
  };

  localStorage.setItem("adminToken", token);
  localStorage.setItem("ccms-admin-token", token);
  localStorage.setItem("ccms-admin-session", JSON.stringify(cleanUser));
  localStorage.setItem("adminUser", JSON.stringify(cleanUser));
  localStorage.setItem("adminProfile", JSON.stringify(cleanUser));
  localStorage.setItem("user", JSON.stringify(cleanUser));
}

export function logoutAdmin() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("ccms-admin-token");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("ccms-admin-session");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("adminProfile");
  localStorage.removeItem("user");
  localStorage.removeItem("profile");
  localStorage.removeItem("adminRefreshToken");
}
