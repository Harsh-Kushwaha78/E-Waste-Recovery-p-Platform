// backend/src/utils/deriveWorkingStatus.js
//
// IMPORTANT: this is a plain rule-based heuristic, NOT a machine-learning
// model. It must never be described to the user as "AI" or "ML" (see
// master prompt section 6 - No Fake AI Rule). It exists so a component's
// workingStatus is derived from what was actually observed during
// testing, rather than the user picking an arbitrary status with no
// backing evidence (section 12 - Trust System).
//
// Each function returns { status, reasons } where reasons is a list of
// short human-readable strings explaining the derivation, so the result
// is always explainable - never a black box.

const STATUS = {
  VERIFIED_WORKING: "VERIFIED_WORKING",
  LIKELY_WORKING: "LIKELY_WORKING",
  NOT_WORKING: "NOT_WORKING",
  NOT_TESTED: "NOT_TESTED",
};

function deriveForRam(r = {}) {
  const reasons = [];
  if (r.detected === false) {
    reasons.push("Not detected by the system.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.memoryTestPassed === false) {
    reasons.push("Memory test failed.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.detected && r.memoryTestPassed) {
    reasons.push("Detected by the system.", "Memory test passed.");
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  if (r.detected === true) {
    reasons.push("Detected, but memory test not completed.");
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  reasons.push("Test not completed.");
  return { status: STATUS.NOT_TESTED, reasons };
}

function deriveForStorage(r = {}) {
  // shared logic for ssd/hdd
  const reasons = [];
  if (r.detected === false) {
    reasons.push("Not detected by the system.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.readWriteTestPassed === false) {
    reasons.push("Read/write test failed.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (typeof r.smartHealthPercent === "number" && r.smartHealthPercent < 50) {
    reasons.push(`SMART health is low (${r.smartHealthPercent}%).`);
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  if (r.detected && r.readWriteTestPassed) {
    reasons.push("Detected by the system.", "Read/write test passed.");
    if (typeof r.smartHealthPercent === "number") {
      reasons.push(`SMART health: ${r.smartHealthPercent}%.`);
    }
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  if (r.detected === true) {
    reasons.push("Detected, but read/write test not completed.");
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  reasons.push("Test not completed.");
  return { status: STATUS.NOT_TESTED, reasons };
}

function deriveForBattery(r = {}) {
  const reasons = [];
  if (r.swelling === true) {
    reasons.push("Swelling detected - unsafe, treat as not working.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.charges === false) {
    reasons.push("Does not charge.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.holdsCharge === false) {
    reasons.push("Charges but does not hold charge.");
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  if (r.charges && r.holdsCharge) {
    reasons.push("Charges normally.", "Holds charge.");
    if (typeof r.healthPercent === "number") {
      reasons.push(`Battery health: ${r.healthPercent}%.`);
      if (r.healthPercent < 50) {
        reasons.push("Health below 50% - degraded but functional.");
        return { status: STATUS.LIKELY_WORKING, reasons };
      }
    }
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  reasons.push("Test not completed.");
  return { status: STATUS.NOT_TESTED, reasons };
}

function deriveForDisplay(r = {}) {
  const reasons = [];
  if (r.turnsOn === false) {
    reasons.push("Does not turn on.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.cracked === true) {
    reasons.push("Screen is cracked.");
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  if (r.deadPixels === true || r.linesOrFlicker === true) {
    reasons.push(
      r.deadPixels ? "Dead pixels present." : "Lines/flicker present."
    );
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  if (r.turnsOn && r.brightnessOk !== false) {
    reasons.push("Turns on.", "No visible defects reported.");
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  reasons.push("Test not completed.");
  return { status: STATUS.NOT_TESTED, reasons };
}

function deriveForKeyboard(r = {}) {
  const reasons = [];
  if (typeof r.faultyKeysCount !== "number") {
    reasons.push("Test not completed.");
    return { status: STATUS.NOT_TESTED, reasons };
  }
  if (r.faultyKeysCount === 0) {
    reasons.push("No faulty keys found.");
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  if (r.faultyKeysCount <= 3) {
    reasons.push(`${r.faultyKeysCount} faulty key(s) found.`);
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  reasons.push(`${r.faultyKeysCount} faulty keys found - extensive damage.`);
  return { status: STATUS.NOT_WORKING, reasons };
}

function deriveForCamera(r = {}) {
  const reasons = [];
  if (r.detected === false) {
    reasons.push("Not detected by the system.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.imageCaptured === false) {
    reasons.push("Detected, but could not capture an image.");
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  if (r.detected && r.imageCaptured) {
    reasons.push("Detected by the system.", "Successfully captured an image.");
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  reasons.push("Test not completed.");
  return { status: STATUS.NOT_TESTED, reasons };
}

function deriveForSpeaker(r = {}) {
  const reasons = [];
  if (r.audioOutput === false) {
    reasons.push("No audio output.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.distortion === true) {
    reasons.push("Audio output present, but distorted.");
    return { status: STATUS.LIKELY_WORKING, reasons };
  }
  if (r.audioOutput === true) {
    reasons.push("Audio output present.", "No distortion reported.");
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  reasons.push("Test not completed.");
  return { status: STATUS.NOT_TESTED, reasons };
}

function deriveForGeneric(r = {}) {
  // motherboard, gpu, cooling_fan, wifi_card, charger, other
  const reasons = [];
  if (r.powersOn === false) {
    reasons.push("Does not power on / activate.");
    return { status: STATUS.NOT_WORKING, reasons };
  }
  if (r.powersOn === true) {
    reasons.push("Powers on / activates as expected.");
    return { status: STATUS.VERIFIED_WORKING, reasons };
  }
  reasons.push("Test not completed.");
  return { status: STATUS.NOT_TESTED, reasons };
}

const DERIVERS = {
  ram: deriveForRam,
  ssd: deriveForStorage,
  hdd: deriveForStorage,
  battery: deriveForBattery,
  display: deriveForDisplay,
  keyboard: deriveForKeyboard,
  camera: deriveForCamera,
  speaker: deriveForSpeaker,
  motherboard: deriveForGeneric,
  gpu: deriveForGeneric,
  cooling_fan: deriveForGeneric,
  wifi_card: deriveForGeneric,
  charger: deriveForGeneric,
  other: deriveForGeneric,
};

// Returns { status, reasons }
function deriveWorkingStatus(componentType, results) {
  const deriver = DERIVERS[componentType] || deriveForGeneric;
  return deriver(results || {});
}

module.exports = { deriveWorkingStatus, STATUS };
