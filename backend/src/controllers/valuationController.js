// backend/src/controllers/valuationController.js
//
// Combines functional testing status, ML price prediction for working
// components, rule-based scrap estimate for non-working components, and
// used-market historical range for context into one Total Recoverable
// Value for a device, saved as a Valuation snapshot.
//
// Honesty notes:
//   - "New price" is NOT shown - this system doesn't track new/retail
//     prices as a distinct data point, so inventing one would violate
//     the no-fabrication rule. Only used-market range and ML-derived
//     recoverable value are shown.
//   - If ml-service is down, affected components are marked
//     "unavailable" with recoverableValue 0 and a clear note - never
//     silently skipped or treated as worthless.

const mongoose = require("mongoose");
const Device = require("../models/Device");
const Component = require("../models/Component");
const Valuation = require("../models/Valuation");
const { getPricePrediction, MlServiceUnavailableError } = require("../services/mlServiceClient");
const { getHistoricalStats } = require("../services/marketDataService");
const { estimateScrapValue } = require("../utils/estimateScrapValue");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const CONFIDENCE_RANK = { LOW: 0, MEDIUM: 1, HIGH: 2 };

// POST /api/valuation/devices/:deviceId
async function generateValuation(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const components = await Component.find({ device: deviceId });
    if (components.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "This device has no components yet. Add components before generating a valuation.",
      });
    }

    const componentValuations = [];
    let totalRecoverableValue = 0;
    let marketLow = 0;
    let marketHigh = 0;
    let hasDemoData = false;
    let hasUnavailableComponents = false;
    let worstConfidenceRank = 2;

    for (const component of components) {
      if (component.workingStatus === "NOT_WORKING") {
        const scrapValue = estimateScrapValue(component.type);
        totalRecoverableValue += scrapValue;
        componentValuations.push({
          component: component._id,
          componentType: component.type,
          workingStatus: component.workingStatus,
          valueBasis: "scrap_estimate",
          recoverableValue: 0,
          scrapValue,
          confidence: null,
          note: "Not working - valued at rule-based scrap estimate only, not market/ML derived.",
        });
        continue;
      }

      const ageYears = device.ageYears ?? 2;
      const features = {
        componentType: component.type,
        brand: component.brand || "Generic",
        condition: component.condition || "unknown",
        workingStatus: component.workingStatus || "NOT_TESTED",
        ageYears,
        health: component.health ?? 50,
      };

      try {
        const mlResult = await getPricePrediction(features);
        totalRecoverableValue += mlResult.prediction.pointEstimate;
        if (mlResult.isDemoData) hasDemoData = true;

        const rank = CONFIDENCE_RANK[mlResult.prediction.confidence] ?? 0;
        if (rank < worstConfidenceRank) worstConfidenceRank = rank;

        componentValuations.push({
          component: component._id,
          componentType: component.type,
          workingStatus: component.workingStatus,
          valueBasis: "ml_prediction",
          recoverableValue: mlResult.prediction.pointEstimate,
          scrapValue: 0,
          confidence: mlResult.prediction.confidence,
          modelVersion: mlResult.model.version,
          isDemoData: mlResult.isDemoData,
          note: mlResult.isDemoData ? mlResult.dataDisclaimer : undefined,
        });

        const stats = await getHistoricalStats(component.type, component.brand);
        if (stats.available) {
          marketLow += stats.min;
          marketHigh += stats.max;
        }
      } catch (err) {
        hasUnavailableComponents = true;
        worstConfidenceRank = 0;
        componentValuations.push({
          component: component._id,
          componentType: component.type,
          workingStatus: component.workingStatus,
          valueBasis: "unavailable",
          recoverableValue: 0,
          scrapValue: 0,
          confidence: null,
          note:
            err instanceof MlServiceUnavailableError
              ? "ML price-prediction service was unavailable when this valuation was generated."
              : `Prediction failed: ${err.message}`,
        });
      }
    }

    const overallConfidence = Object.keys(CONFIDENCE_RANK).find(
      (k) => CONFIDENCE_RANK[k] === worstConfidenceRank
    );

    const valuation = await Valuation.create({
      device: device._id,
      owner: req.user._id,
      componentValuations,
      totalRecoverableValue: Math.round(totalRecoverableValue),
      usedMarketRangeLow: marketLow || undefined,
      usedMarketRangeHigh: marketHigh || undefined,
      overallConfidence,
      hasDemoData,
      hasUnavailableComponents,
    });

    res.status(201).json({ status: "ok", valuation });
  } catch (err) {
    next(err);
  }
}

// GET /api/valuation/devices/:deviceId - most recent valuation
async function getLatestValuation(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const valuation = await Valuation.findOne({ device: deviceId }).sort({ createdAt: -1 });
    if (!valuation) {
      return res.status(404).json({
        status: "error",
        message: "No valuation has been generated for this device yet.",
      });
    }

    res.status(200).json({ status: "ok", valuation });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateValuation, getLatestValuation, getValuationHistory };

// GET /api/valuation/devices/:deviceId/history
async function getValuationHistory(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const history = await Valuation.find({ device: deviceId })
      .sort({ createdAt: 1 })
      .select("totalRecoverableValue overallConfidence hasDemoData hasUnavailableComponents createdAt");

    res.status(200).json({ status: "ok", count: history.length, history });
  } catch (err) {
    next(err);
  }
}
