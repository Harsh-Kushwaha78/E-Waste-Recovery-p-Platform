// backend/tests/deriveWorkingStatus.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { deriveWorkingStatus } = require("../src/utils/deriveWorkingStatus");

test("empty input always returns NOT_TESTED for every component type", () => {
  const types = ["ram", "ssd", "hdd", "battery", "display", "keyboard", "camera", "speaker", "motherboard", "gpu", "cooling_fan", "wifi_card", "charger", "other"];
  for (const type of types) {
    const { status } = deriveWorkingStatus(type, {});
    assert.equal(status, "NOT_TESTED", `${type} with empty input should be NOT_TESTED`);
  }
});

test("RAM: detected + memory test passed => VERIFIED_WORKING", () => {
  const { status, reasons } = deriveWorkingStatus("ram", { detected: true, memoryTestPassed: true });
  assert.equal(status, "VERIFIED_WORKING");
  assert.ok(reasons.length > 0);
});

test("RAM: not detected => NOT_WORKING regardless of other fields", () => {
  const { status } = deriveWorkingStatus("ram", { detected: false, memoryTestPassed: true });
  assert.equal(status, "NOT_WORKING");
});

test("SSD: low SMART health downgrades to LIKELY_WORKING even if tests pass", () => {
  const { status } = deriveWorkingStatus("ssd", { detected: true, readWriteTestPassed: true, smartHealthPercent: 30 });
  assert.equal(status, "LIKELY_WORKING");
});

test("Battery: swelling is always NOT_WORKING regardless of charge status", () => {
  const { status, reasons } = deriveWorkingStatus("battery", { swelling: true, charges: true, holdsCharge: true });
  assert.equal(status, "NOT_WORKING");
  assert.ok(reasons.some((r) => r.toLowerCase().includes("swelling")));
});

test("Display: cracked screen downgrades even if it turns on fine", () => {
  const { status } = deriveWorkingStatus("display", { turnsOn: true, cracked: true });
  assert.equal(status, "LIKELY_WORKING");
});

test("Keyboard: 0 faulty keys => VERIFIED_WORKING, >3 => NOT_WORKING", () => {
  assert.equal(deriveWorkingStatus("keyboard", { faultyKeysCount: 0 }).status, "VERIFIED_WORKING");
  assert.equal(deriveWorkingStatus("keyboard", { faultyKeysCount: 2 }).status, "LIKELY_WORKING");
  assert.equal(deriveWorkingStatus("keyboard", { faultyKeysCount: 8 }).status, "NOT_WORKING");
});

test("Unknown component type falls back to generic powersOn logic", () => {
  const { status } = deriveWorkingStatus("some_future_type", { powersOn: true });
  assert.equal(status, "VERIFIED_WORKING");
});
