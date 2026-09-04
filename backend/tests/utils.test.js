// backend/tests/utils.test.js
const test = require("node:test");
const assert = require("node:assert/strict");

const { classifyForRecycling } = require("../src/utils/classifyForRecycling");
const { estimateScrapValue } = require("../src/utils/estimateScrapValue");
const { buildGeneralExplanation } = require("../src/utils/buildPriceExplanation");
const { buildChatSystemPrompt } = require("../src/utils/buildChatSystemPrompt");
const { computeStats } = require("../src/services/marketDataService");

test("classifyForRecycling: battery is hazardous with safety-conscious guidance", () => {
  const result = classifyForRecycling("battery");
  assert.equal(result.hazardous, true);
  assert.equal(result.category, "hazardous");
  const allGuidance = result.guidance.join(" ").toLowerCase();
  assert.match(allGuidance, /do not puncture|do not open/);
});

test("classifyForRecycling: unknown component type falls back safely", () => {
  const result = classifyForRecycling("nonexistent_type_xyz");
  assert.equal(result.category, "general_recyclable");
  assert.equal(result.hazardous, false);
});

test("estimateScrapValue: returns a positive number for every known type", () => {
  const types = ["ram", "ssd", "hdd", "battery", "motherboard", "display", "gpu"];
  for (const t of types) {
    assert.ok(estimateScrapValue(t) > 0, `${t} should have positive scrap value`);
  }
});

test("estimateScrapValue: unknown type falls back to 'other' value", () => {
  assert.equal(estimateScrapValue("totally_unknown"), estimateScrapValue("other"));
});

test("buildGeneralExplanation: NOT_WORKING leads with the negative factor", () => {
  const points = buildGeneralExplanation({
    ageYears: 5, health: 20, condition: "poor", workingStatus: "NOT_WORKING",
  });
  assert.match(points[0], /not working/i);
});

test("buildGeneralExplanation: VERIFIED_WORKING + high health is positive", () => {
  const points = buildGeneralExplanation({
    ageYears: 0.5, health: 95, condition: "excellent", workingStatus: "VERIFIED_WORKING",
  });
  assert.match(points.join(" "), /verified working/i);
  assert.match(points.join(" "), /high/i);
});

test("buildChatSystemPrompt: instructs the model not to invent prices", () => {
  const prompt = buildChatSystemPrompt({
    device: { name: "Test Laptop", category: "laptop", ageYears: 2 },
    components: [],
    valuation: null,
  });
  assert.match(prompt, /never invent or guess/i);
  assert.match(prompt, /Test Laptop/);
});

test("buildChatSystemPrompt: flags demo data when valuation used it", () => {
  const prompt = buildChatSystemPrompt({
    device: { name: "Test Laptop", category: "laptop", ageYears: 2 },
    components: [],
    valuation: {
      totalRecoverableValue: 1000,
      overallConfidence: "MEDIUM",
      hasDemoData: true,
      componentValuations: [],
    },
  });
  assert.match(prompt, /DEMO\/SYNTHETIC data/);
});

test("marketDataService.computeStats: correct aggregation math", () => {
  const records = [
    { price: 1900, source: "OLX", observedDate: new Date("2026-08-15") },
    { price: 2000, source: "Admin", observedDate: new Date("2026-08-10") },
    { price: 1800, source: "OLX", observedDate: new Date("2026-08-01") },
  ];
  const stats = computeStats(records);
  assert.equal(stats.available, true);
  assert.equal(stats.min, 1800);
  assert.equal(stats.max, 2000);
  assert.equal(stats.average, 1900);
  assert.equal(stats.sampleSize, 3);
  assert.deepEqual(stats.sources.sort(), ["Admin", "OLX"]);
});

test("marketDataService.computeStats: empty input is handled honestly", () => {
  const stats = computeStats([]);
  assert.equal(stats.available, false);
  assert.match(stats.note, /no historical/i);
});
