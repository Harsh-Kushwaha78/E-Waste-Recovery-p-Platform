// frontend/src/lib/listings.js
import { apiRequest } from "./api";

export function browseListings(token, filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  );
  return apiRequest(`/api/listings?${params.toString()}`, { token });
}

export function getListing(token, id) {
  return apiRequest(`/api/listings/${id}`, { token });
}

export function createListing(token, payload) {
  return apiRequest("/api/listings", { method: "POST", body: payload, token });
}

export function updateListing(token, id, payload) {
  return apiRequest(`/api/listings/${id}`, { method: "PUT", body: payload, token });
}

export function deleteListing(token, id) {
  return apiRequest(`/api/listings/${id}`, { method: "DELETE", token });
}

export function myListings(token) {
  return apiRequest("/api/listings/mine", { token });
}
