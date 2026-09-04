// frontend/src/lib/prices.js
import { apiRequest, API_BASE_URL } from "./api";

export function listPrices(token, componentType) {
  const query = componentType ? `?componentType=${componentType}` : "";
  return apiRequest(`/api/prices${query}`, { token });
}

export function createPrice(token, payload) {
  return apiRequest("/api/prices", { method: "POST", body: payload, token });
}

export function deletePrice(token, id) {
  return apiRequest(`/api/prices/${id}`, { method: "DELETE", token });
}

// File upload needs multipart/form-data, so this bypasses the JSON
// apiRequest helper and builds the request directly.
export async function importPricesCsv(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/prices/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.message || "Import failed."), { data });
  }
  return data;
}
