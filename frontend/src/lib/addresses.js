// frontend/src/lib/addresses.js
import { apiRequest } from "./api";

export async function listAddresses(token) {
  return apiRequest("/api/addresses", { token });
}

export async function createAddress(token, addressData) {
  return apiRequest("/api/addresses", {
    method: "POST",
    token,
    body: addressData,
  });
}

export async function getAddress(token, id) {
  return apiRequest(`/api/addresses/${id}`, { token });
}

export async function updateAddress(token, id, addressData) {
  return apiRequest(`/api/addresses/${id}`, {
    method: "PUT",
    token,
    body: addressData,
  });
}

export async function deleteAddress(token, id) {
  return apiRequest(`/api/addresses/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function setDefaultAddress(token, id) {
  return apiRequest(`/api/addresses/${id}/default`, {
    method: "PATCH",
    token,
  });
}
