// frontend/src/lib/devices.js
//
// Thin wrappers around apiRequest for device/component endpoints. Keeps
// pages from repeating URL strings and lets us change API shapes in one
// place later.

import { apiRequest } from "./api";

export function listDevices(token) {
  return apiRequest("/api/devices", { token });
}

export function createDevice(token, payload) {
  return apiRequest("/api/devices", { method: "POST", body: payload, token });
}

export function getDevice(token, id) {
  return apiRequest(`/api/devices/${id}`, { token });
}

export function updateDevice(token, id, payload) {
  return apiRequest(`/api/devices/${id}`, { method: "PUT", body: payload, token });
}

export function deleteDevice(token, id) {
  return apiRequest(`/api/devices/${id}`, { method: "DELETE", token });
}

export function createComponent(token, deviceId, payload) {
  return apiRequest(`/api/devices/${deviceId}/components`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateComponent(token, id, payload) {
  return apiRequest(`/api/components/${id}`, { method: "PUT", body: payload, token });
}

export function deleteComponent(token, id) {
  return apiRequest(`/api/components/${id}`, { method: "DELETE", token });
}

export const DEVICE_CATEGORIES = [
  "laptop",
  "desktop",
  "smartphone",
  "tablet",
  "monitor",
  "printer",
  "television",
  "other",
];

export const COMPONENT_TYPES = [
  "ram",
  "ssd",
  "hdd",
  "battery",
  "motherboard",
  "display",
  "gpu",
  "cooling_fan",
  "wifi_card",
  "charger",
  "keyboard",
  "camera",
  "speaker",
  "other",
];

export const WORKING_STATUSES = [
  "VERIFIED_WORKING",
  "LIKELY_WORKING",
  "NOT_WORKING",
  "NOT_TESTED",
];
