// frontend/src/lib/valuationHistory.js
import { apiRequest } from "./api";

export function getValuationHistory(token, deviceId) {
  return apiRequest(`/api/valuation/devices/${deviceId}/history`, { token });
}
