const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function handleResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function loginApi(email, password, role) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  });

  return handleResponse(res);
}

export async function signupApi(name, roll, email, password, role) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, roll, email, password, role }),
  });

  return handleResponse(res);
}


// Get public stats for landing page
export async function getLandingStatsApi() {
  try {
    const res = await fetch(`${API_BASE}/complaints/public/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  } catch (error) {
    console.error("Failed to fetch landing stats:", error);
    // Return fallback values if API fails
    return {
      totalResolved: 1200,
      avgResponseTime: "24 Hrs",
      satisfactionRate: 95,
    };
  }
}