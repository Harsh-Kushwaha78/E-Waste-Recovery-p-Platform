// backend/src/utils/estimateScrapValue.js
//
// For components that are NOT_WORKING, there's no resale value, but
// materials inside (metals, etc.) often still have small scrap value.
// This is a rough, explicitly rule-based heuristic (flat estimate per
// component type) - NOT derived from market data or ML. Never label
// this "AI" or "ML" anywhere it's surfaced (master prompt section 6).

const SCRAP_VALUES_INR = {
  ram: 40,
  ssd: 60,
  hdd: 90,
  battery: 30,
  motherboard: 120,
  display: 50,
  gpu: 150,
  cooling_fan: 20,
  wifi_card: 15,
  charger: 25,
  keyboard: 10,
  camera: 5,
  speaker: 15,
  other: 20,
};

function estimateScrapValue(componentType) {
  return SCRAP_VALUES_INR[componentType] ?? SCRAP_VALUES_INR.other;
}

module.exports = { estimateScrapValue, SCRAP_VALUES_INR };
