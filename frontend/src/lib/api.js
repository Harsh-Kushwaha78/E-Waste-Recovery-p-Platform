// frontend/src/lib/api.js
//
// Tiny fetch wrapper. Keeps API_BASE_URL and error-handling logic in one
// place so pages don't repeat it.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned an unexpected (non-JSON) response.");
  }

  if (!res.ok) {
    // Backend always returns { status: "error", message: "..." } on failure,
    // so we surface that message directly rather than a generic one.
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export { apiRequest, API_BASE_URL };
