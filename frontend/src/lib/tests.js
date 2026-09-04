// frontend/src/lib/tests.js
import { apiRequest } from "./api";

export function listTests(token, componentId) {
  return apiRequest(`/api/components/${componentId}/tests`, { token });
}

export function submitTest(token, componentId, payload) {
  return apiRequest(`/api/components/${componentId}/tests`, {
    method: "POST",
    body: payload,
    token,
  });
}

// Field definitions per component type, used to render the right form
// and to know which fields are booleans vs numbers vs text.
// Kept in sync manually with backend/src/utils/deriveWorkingStatus.js -
// if you add a field there, add it here too so the form can submit it.
export const TEST_FIELDS = {
  ram: [
    { key: "detected", label: "Detected by the system?", type: "bool" },
    { key: "memoryTestPassed", label: "Memory test passed?", type: "bool" },
  ],
  ssd: [
    { key: "detected", label: "Detected by the system?", type: "bool" },
    { key: "smartHealthPercent", label: "SMART health (%)", type: "number" },
    { key: "readWriteTestPassed", label: "Read/write test passed?", type: "bool" },
  ],
  hdd: [
    { key: "detected", label: "Detected by the system?", type: "bool" },
    { key: "smartHealthPercent", label: "SMART health (%)", type: "number" },
    { key: "readWriteTestPassed", label: "Read/write test passed?", type: "bool" },
  ],
  battery: [
    { key: "charges", label: "Charges?", type: "bool" },
    { key: "holdsCharge", label: "Holds charge?", type: "bool" },
    { key: "healthPercent", label: "Battery health (%)", type: "number" },
    { key: "swelling", label: "Swelling?", type: "bool" },
  ],
  display: [
    { key: "turnsOn", label: "Turns on?", type: "bool" },
    { key: "cracked", label: "Cracked?", type: "bool" },
    { key: "deadPixels", label: "Dead pixels?", type: "bool" },
    { key: "linesOrFlicker", label: "Lines / flicker?", type: "bool" },
    { key: "brightnessOk", label: "Brightness OK?", type: "bool" },
  ],
  keyboard: [{ key: "faultyKeysCount", label: "Number of faulty keys", type: "number" }],
  camera: [
    { key: "detected", label: "Detected by the system?", type: "bool" },
    { key: "imageCaptured", label: "Successfully captured an image?", type: "bool" },
  ],
  speaker: [
    { key: "audioOutput", label: "Audio output present?", type: "bool" },
    { key: "distortion", label: "Distortion?", type: "bool" },
  ],
  motherboard: [{ key: "powersOn", label: "Powers on?", type: "bool" }],
  gpu: [{ key: "powersOn", label: "Powers on / detected?", type: "bool" }],
  cooling_fan: [{ key: "powersOn", label: "Spins when powered?", type: "bool" }],
  wifi_card: [{ key: "powersOn", label: "Detected / connects?", type: "bool" }],
  charger: [{ key: "powersOn", label: "Outputs power?", type: "bool" }],
  other: [{ key: "powersOn", label: "Powers on / functions?", type: "bool" }],
};
