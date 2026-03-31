const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function fetchFilterOptions() {
  const res = await fetch(`${API_BASE}/filters`);
  if (!res.ok) throw new Error("Failed to fetch filter options");
  return res.json();
}

export async function fetchDashboardData(filters = {}) {
  const res = await fetch(`${API_BASE}/dashboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

export async function fetchPrediction(filters = {}) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to fetch prediction");
  return res.json();
}

export async function fetchHospitalMatches(patientProfile, weights = null, topN = 10) {
  const res = await fetch(`${API_BASE}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patient_profile: patientProfile,
      weights: weights,
      top_n: topN,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch hospital matches");
  return res.json();
}

export async function fetchCities() {
  const res = await fetch(`${API_BASE}/cities`);
  if (!res.ok) throw new Error("Failed to fetch cities");
  return res.json();
}

export async function fetchHealthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend not available");
  return res.json();
}
