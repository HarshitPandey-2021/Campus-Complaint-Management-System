const API_BASE = import.meta.env.VITE_API_URL;

// -------- Complaints --------
export async function getAllComplaints(token) {
  const res = await fetch(`${API_BASE}/complaints`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getComplaintById(id, token) {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function updateComplaintStatus(id, status, token, remarks) {
  // If "remarks" is used for your backend DB, else remove it!
  const body = remarks !== undefined
    ? JSON.stringify({ status, remarks })
    : JSON.stringify({ status });

  const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body
  });
  return res.json();
}

// -------- Stats/Analytics --------
export async function getStats(token) {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getComplaintsByCategory(token) {
  const res = await fetch(`${API_BASE}/analytics/category`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getComplaintsByStatus(token) {
  const res = await fetch(`${API_BASE}/analytics/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getComplaintsTrend(token) {
  const res = await fetch(`${API_BASE}/analytics/trend`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getPriorityDistribution(token) {
  const res = await fetch(`${API_BASE}/analytics/priority`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getAverageResolutionTime(token) {
  const res = await fetch(`${API_BASE}/analytics/average-resolution-time`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// -------- Activity Logs --------
export async function getAllLogs(token) {
  const res = await fetch(`${API_BASE}/logs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// -------- Profile --------
export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function updateProfile(data, token) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}
