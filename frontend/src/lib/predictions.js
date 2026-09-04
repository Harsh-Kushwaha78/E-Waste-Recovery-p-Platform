// frontend/src/lib/predictions.js
import { apiRequest } from "./api";

export function requestPrediction(token, componentId) {
  return apiRequest(`/api/predictions/components/${componentId}`, {
    method: "POST",
    token,
  });
}

export function listPredictions(token, componentId) {
  return apiRequest(`/api/predictions/components/${componentId}`, { token });
}
