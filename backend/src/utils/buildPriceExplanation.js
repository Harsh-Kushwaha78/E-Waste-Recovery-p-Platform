// backend/src/utils/buildPriceExplanation.js
//
// "Why this price?" Two distinct kinds of explanation must never be
// blended together:
//   1. MODEL-DERIVED: the ML model's own feature importances (computed
//      at training time - see Prediction.topFeatureImportances).
//   2. GENERAL EXPLANATION: plain-language statements about this
//      specific component's attributes, generated with simple rules
//      here - NOT claimed to be the model's reasoning, just context.
//
// This function only builds #2. Callers must keep #1 and #2 labeled
// separately in the API response and UI.

function buildGeneralExplanation({ ageYears, health, condition, workingStatus }) {
  const points = [];

  if (workingStatus === "NOT_WORKING") {
    points.push("This component is not working, which is the single biggest factor pulling its value down.");
  } else if (workingStatus === "VERIFIED_WORKING") {
    points.push("This component is verified working through an actual test, which supports a higher value.");
  } else if (workingStatus === "LIKELY_WORKING") {
    points.push("This component is only likely working (not fully verified) - value reflects that uncertainty.");
  } else {
    points.push("This component has not been tested yet - value is based on limited information.");
  }

  if (typeof health === "number") {
    if (health >= 80) {
      points.push(`Health is high (${health}%), which supports a higher value.`);
    } else if (health >= 50) {
      points.push(`Health is moderate (${health}%).`);
    } else {
      points.push(`Health is low (${health}%), which pulls value down.`);
    }
  }

  if (typeof ageYears === "number") {
    if (ageYears <= 1) {
      points.push("This component is relatively new (under 1 year), which supports a higher value.");
    } else if (ageYears >= 4) {
      points.push(`At ${ageYears} years old, depreciation is a significant factor.`);
    }
  }

  if (condition && condition !== "unknown") {
    points.push(`Physical condition was recorded as "${condition}".`);
  }

  return points;
}

module.exports = { buildGeneralExplanation };
