// frontend/src/lib/chat.js
import { apiRequest } from "./api";

export function getChatHistory(token, deviceId) {
  return apiRequest(`/api/chat/devices/${deviceId}`, { token });
}

export function sendChatMessage(token, deviceId, message) {
  return apiRequest(`/api/chat/devices/${deviceId}`, {
    method: "POST",
    body: { message },
    token,
  });
}
