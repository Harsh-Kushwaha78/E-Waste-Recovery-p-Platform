// frontend/src/lib/pickups.js
import { apiRequest } from "./api";

export async function checkServiceability(token, pincode) {
  return apiRequest(`/api/recycling/serviceability?pincode=${encodeURIComponent(pincode)}`, {
    token,
  });
}

export async function createPickupRequest(token, payload) {
  return apiRequest("/api/recycling/pickups", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function listMyPickups(token) {
  return apiRequest("/api/recycling/pickups/mine", { token });
}

export async function getPickup(token, id) {
  return apiRequest(`/api/recycling/pickups/${id}`, { token });
}

export async function cancelMyPickup(token, id, reason) {
  return apiRequest(`/api/recycling/pickups/${id}/cancel`, {
    method: "PATCH",
    token,
    body: { reason },
  });
}

// Admin API
export async function adminListPickups(token, status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest(`/api/admin/pickups${query}`, { token });
}

export async function adminUpdatePickupStatus(token, id, payload) {
  return apiRequest(`/api/admin/pickups/${id}/status`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function adminListOrders(token, status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest(`/api/admin/orders${query}`, { token });
}
