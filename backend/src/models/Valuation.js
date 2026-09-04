// backend/src/models/Valuation.js
//
// A Valuation is a snapshot of a device's total recoverable value,
// combining per-component ML predictions (for working components) and
// scrap estimates (for non-working ones). Kept as a history (Phase 10
// builds on this) rather than a single mutable "current value" field.

const mongoose = require("mongoose");

const componentValuationSchema = new mongoose.Schema(
  {
    component: { type: mongoose.Schema.Types.ObjectId, ref: "Component", required: true },
    componentType: { type: String, required: true },
    workingStatus: { type: String, required: true },
    valueBasis: {
      type: String,
      enum: ["ml_prediction", "scrap_estimate", "unavailable"],
      required: true,
    },
    recoverableValue: { type: Number, default: 0 },
    scrapValue: { type: Number, default: 0 },
    confidence: { type: String, enum: ["HIGH", "MEDIUM", "LOW", null], default: null },
    modelVersion: { type: String },
    isDemoData: { type: Boolean, default: false },
    note: { type: String },
  },
  { _id: false }
);

const valuationSchema = new mongoose.Schema(
  {
    device: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    componentValuations: [componentValuationSchema],
    totalRecoverableValue: { type: Number, required: true },
    usedMarketRangeLow: { type: Number },
    usedMarketRangeHigh: { type: Number },
    overallConfidence: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], required: true },
    hasDemoData: { type: Boolean, default: false },
    hasUnavailableComponents: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Valuation", valuationSchema);
