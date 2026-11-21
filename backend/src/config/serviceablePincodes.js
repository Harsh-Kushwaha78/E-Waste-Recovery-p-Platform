// backend/src/config/serviceablePincodes.js
//
// Honest, configurable service-area rules for doorstep e-waste recycling pickup.
// We do NOT claim that all Indian PIN codes are serviceable.
// Serviceable PIN codes are configurable via the SERVICEABLE_PINCODES environment
// variable (comma-separated list), with a transparent default set of primary
// metropolitan collection zones.

const DEFAULT_SERVICEABLE_AREAS = {
  // Bengaluru
  "560001": { city: "Bengaluru", state: "Karnataka", estimatedDays: 2 },
  "560002": { city: "Bengaluru", state: "Karnataka", estimatedDays: 2 },
  "560025": { city: "Bengaluru", state: "Karnataka", estimatedDays: 2 },
  "560034": { city: "Bengaluru", state: "Karnataka", estimatedDays: 2 },
  "560038": { city: "Bengaluru", state: "Karnataka", estimatedDays: 2 },
  "560100": { city: "Bengaluru", state: "Karnataka", estimatedDays: 3 },
  // Mumbai
  "400001": { city: "Mumbai", state: "Maharashtra", estimatedDays: 2 },
  "400050": { city: "Mumbai", state: "Maharashtra", estimatedDays: 2 },
  "400076": { city: "Mumbai", state: "Maharashtra", estimatedDays: 3 },
  // Delhi NCR
  "110001": { city: "New Delhi", state: "Delhi", estimatedDays: 2 },
  "110020": { city: "New Delhi", state: "Delhi", estimatedDays: 2 },
  // Hyderabad
  "500001": { city: "Hyderabad", state: "Telangana", estimatedDays: 3 },
  "500081": { city: "Hyderabad", state: "Telangana", estimatedDays: 3 },
  // Chennai
  "600001": { city: "Chennai", state: "Tamil Nadu", estimatedDays: 3 },
  // Pune
  "411001": { city: "Pune", state: "Maharashtra", estimatedDays: 3 },
};

function getServiceableMap() {
  const customList = process.env.SERVICEABLE_PINCODES;
  if (!customList) {
    return DEFAULT_SERVICEABLE_AREAS;
  }

  const customPincodes = customList
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const merged = { ...DEFAULT_SERVICEABLE_AREAS };
  for (const pin of customPincodes) {
    if (!merged[pin]) {
      merged[pin] = { city: "Configured Area", state: "India", estimatedDays: 3 };
    }
  }
  return merged;
}

function checkPincodeServiceability(pincode) {
  if (!pincode || typeof pincode !== "string") {
    return {
      serviceable: false,
      pincode: pincode || "",
      message: "Please enter a valid 6-digit Indian PIN code.",
    };
  }

  const cleaned = pincode.trim();
  const isValidFormat = /^[1-9][0-9]{5}$/.test(cleaned);

  if (!isValidFormat) {
    return {
      serviceable: false,
      pincode: cleaned,
      message: "Invalid PIN code format. It must be a 6-digit Indian postal code.",
    };
  }

  const map = getServiceableMap();
  const match = map[cleaned];

  if (match) {
    return {
      serviceable: true,
      pincode: cleaned,
      city: match.city,
      state: match.state,
      estimatedDays: match.estimatedDays,
      message: `Doorstep pickup is available in ${match.city}, ${match.state} (Estimated collection within ${match.estimatedDays} business days).`,
    };
  }

  return {
    serviceable: false,
    pincode: cleaned,
    message: `Doorstep pickup is currently not available in PIN code ${cleaned}. You can still use physical e-waste drop-off centers.`,
  };
}

module.exports = {
  checkPincodeServiceability,
  DEFAULT_SERVICEABLE_AREAS,
};
