// src/api.js

// Backend base URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

console.log("🔧 API Base URL:", API_BASE); // ✅ DEBUG - Verify URL

// Small helper to handle responses
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---------- AUTH ----------

// LOGIN - POST /api/auth/login
export async function login(email, password, role = "student") {
  console.log("🔗 API Login CALL:", { email, role }); // ✅ DEBUG
  
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  
  console.log("📤 Backend response status:", res.status); // ✅ DEBUG
  // Expect: { message, user, token }
  return handleResponse(res);
}

// SIGNUP - POST /api/auth/register
export async function signup(name, roll, email, password, role = "student") {
  console.log("📝 Signup CALL:", { name, email, role }); // ✅ DEBUG
  
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, roll, email, password, role }),
  });
  
  // Expect: { message, user, token }
  return handleResponse(res);
}

// ---------- STUDENT COMPLAINTS (JSON payload version) ----------

// Get all personal complaints
export async function getMyComplaints(token) {
  console.log("📋 Fetching my complaints"); // ✅ DEBUG
  
  const res = await fetch(`${API_BASE}/complaints/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

// Get a specific complaint by id
export async function getComplaintById(id, token) {
  console.log("📄 Fetching complaint:", id); // ✅ DEBUG
  
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

// Submit a new complaint (JSON body)
export async function submitComplaint(data, token) {
  console.log("📤 Submitting complaint:", data.subject?.substring(0, 50) + "..."); // ✅ DEBUG
  
  const res = await fetch(`${API_BASE}/complaints`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ---------- UTILITY FUNCTIONS ----------

// Check if token is valid
export async function checkAuth(token) {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
