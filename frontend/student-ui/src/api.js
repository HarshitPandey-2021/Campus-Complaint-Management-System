const API_BASE = import.meta.env.VITE_API_URL || "/api";

// LOGIN (POST /api/auth/login)
export async function login(email, password, role = "student") {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

// SIGNUP (POST /api/auth/register)
export async function signup(name, roll, email, password, role = "student") {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, roll, email, password, role })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
}

// Get all personal complaints
export async function getMyComplaints(token) {
  const res = await fetch(`${API_BASE}/complaints/mine`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

// Get a specific complaint by id
export async function getComplaintById(id, token) {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

// Submit a new complaint
export async function submitComplaint(data, token) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}
