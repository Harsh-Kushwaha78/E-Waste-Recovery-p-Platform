// backend/src/models/Prediction.js
//
// Stores a snapshot of a prediction request/response for a component, so
// there's a history of predictions over time (Phase 10 - Valuation
// History will build on this) and so the model version behind any past
// prediction is always traceable.

const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    component: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pointEstimate: { type: Number, required: true },
    rangeLow: { type: Number, required: true },
    rangeHigh: { type: Number, required: true },
    confidence: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], required: true },
    modelName: { type: String, required: true },
    modelVersion: { type: String, required: true },
    algorithm: { type: String },
    evaluationMetrics: { type: mongoose.Schema.Types.Mixed },
    topFeatureImportances: { type: mongoose.Schema.Types.Mixed },
    featureImportanceNote: { type: String },
    isDemoData: { type: Boolean, default: false },
    dataDisclaimer: { type: String },
    inputFeatures: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
