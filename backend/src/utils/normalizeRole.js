// Normalize role
function normalizeRole(role) {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "admin";
  return "student";
}

module.exports = { normalizeRole };
