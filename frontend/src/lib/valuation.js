// frontend/src/lib/valuation.js
import { apiRequest } from "./api";

export function generateValuation(token, deviceId) {
  return apiRequest(`/api/valuation/devices/${deviceId}`, { method: "POST", token });
}

export function getLatestValuation(token, deviceId) {
  return apiRequest(`/api/valuation/devices/${deviceId}`, { token });
}
