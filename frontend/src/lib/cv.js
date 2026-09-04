// frontend/src/lib/cv.js
import { API_BASE_URL } from "./api";

export async function analyzeDeviceImage(token, deviceId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/cv/devices/${deviceId}/analyze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.message || "Image analysis failed."), { data });
  }
  return data;
}
