// frontend/src/lib/orders.js
import { apiRequest } from "./api";

export async function createOrder(token, payload) {
  return apiRequest("/api/orders", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function listMyOrders(token, role) {
  const query = role ? `?role=${role}` : "";
  return apiRequest(`/api/orders/mine${query}`, { token });
}

export async function getOrder(token, id) {
  return apiRequest(`/api/orders/${id}`, { token });
}

export async function updateOrderStatus(token, id, { status, note }) {
  return apiRequest(`/api/orders/${id}/status`, {
    method: "PATCH",
    token,
    body: { status, note },
  });
}
