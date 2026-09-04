// backend/src/controllers/predictionController.js

const mongoose = require("mongoose");
const Component = require("../models/Component");
const Prediction = require("../models/Prediction");
const {
  getPricePrediction,
  MlServiceUnavailableError,
} = require("../services/mlServiceClient");
const { buildGeneralExplanation } = require("../utils/buildPriceExplanation");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/predictions/components/:id
async function predictForComponent(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    const component = await Component.findOne({ _id: id, owner: req.user._id });
    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    const device = await mongoose.model("Device").findById(component.device);
    const ageYears = device?.ageYears ?? 2;

    const features = {
      componentType: component.type,
      brand: component.brand || "Generic",
      condition: component.condition || "unknown",
      workingStatus: component.workingStatus || "NOT_TESTED",
      ageYears,
      health: component.health ?? 50,
    };

    let mlResult;
    try {
      mlResult = await getPricePrediction(features);
    } catch (err) {
      if (err instanceof MlServiceUnavailableError) {
        return res.status(503).json({
          status: "error",
          message:
            "ML price-prediction service is unavailable. The rest of the app still works - you can still track devices, components, tests, and admin price data.",
        });
      }
      return res.status(err.status || 500).json({
        status: "error",
        message: err.message,
        details: err.mlServiceError,
      });
    }

    const prediction = await Prediction.create({
      component: component._id,
      owner: req.user._id,
      pointEstimate: mlResult.prediction.pointEstimate,
      rangeLow: mlResult.prediction.rangeLow,
      rangeHigh: mlResult.prediction.rangeHigh,
      confidence: mlResult.prediction.confidence,
      modelName: mlResult.model.name,
      modelVersion: mlResult.model.version,
      algorithm: mlResult.model.algorithm,
      evaluationMetrics: mlResult.model.evaluationMetrics,
      topFeatureImportances: mlResult.model.topFeatureImportances,
      featureImportanceNote: mlResult.model.featureImportanceNote,
      isDemoData: mlResult.isDemoData,
      dataDisclaimer: mlResult.dataDisclaimer,
      inputFeatures: features,
    });

    res.status(201).json({ status: "ok", prediction });
  } catch (err) {
    next(err);
  }
}

// GET /api/predictions/components/:id
async function listPredictionsForComponent(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    const component = await Component.findOne({ _id: id, owner: req.user._id });
    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    const predictions = await Prediction.find({ component: id }).sort({ createdAt: -1 });

    res.status(200).json({ status: "ok", count: predictions.length, predictions });
  } catch (err) {
    next(err);
  }
}

module.exports = { predictForComponent, listPredictionsForComponent, getWhyThisPrice };

// GET /api/predictions/components/:id/why
async function getWhyThisPrice(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    const component = await Component.findOne({ _id: id, owner: req.user._id });
    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    const latestPrediction = await Prediction.findOne({ component: id }).sort({ createdAt: -1 });
    if (!latestPrediction) {
      return res.status(404).json({
        status: "error",
        message: "No prediction exists yet for this component. Request a prediction first.",
      });
    }

    const generalExplanation = buildGeneralExplanation({
      ageYears: latestPrediction.inputFeatures?.ageYears,
      health: component.health,
      condition: component.condition,
      workingStatus: component.workingStatus,
    });

    res.status(200).json({
      status: "ok",
      pointEstimate: latestPrediction.pointEstimate,
      confidence: latestPrediction.confidence,
      modelDerived: {
        topFeatureImportances: latestPrediction.topFeatureImportances || [],
        note: latestPrediction.featureImportanceNote,
        caveat:
          "These are the model's overall (global) feature importances, learned from all training data - not a per-prediction breakdown of this exact estimate.",
      },
      generalExplanation: {
        points: generalExplanation,
        note: "Plain-language context about this component's recorded attributes - not the model's internal reasoning.",
      },
      isDemoData: latestPrediction.isDemoData,
      dataDisclaimer: latestPrediction.dataDisclaimer,
    });
  } catch (err) {
    next(err);
  }
}
