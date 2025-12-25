// src/api.js  (Landing + simple user app ke liye)

// Backend base URL: env se le lo, fallback /api (agar reverse proxy se aa raha ho)
const API_BASE = import.meta.env.VITE_API_URL || "/api";

// Small helper to handle responses
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---------- AUTH ----------

// LOGIN (POST /api/auth/login)
export async function login(email, password, role = "student") {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Backend loginUser role nahi leta, par tum yaha bhej sakte ho, ignore ho jayega
    body: JSON.stringify({ email, password }),
  });
  // Expect: { message, user, token }
  return handleResponse(res);
}

// SIGNUP (POST /api/auth/register)
export async function signup(
  name,
  roll,
  email,
  password,
  role = "student"
) {
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
  const res = await fetch(`${API_BASE}/complaints/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

// Get a specific complaint by id
export async function getComplaintById(id, token) {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

// Submit a new complaint (JSON body)
// NOTE: Agar tum images/PDF upload nahi kar rahe is entry se to yeh sahi hai.
// File upload wali jagah par alag FormData-based function use karo.
export async function submitComplaint(data, token) {
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
