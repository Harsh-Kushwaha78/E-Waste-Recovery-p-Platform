// backend/src/models/PriceRecord.js
//
// A PriceRecord is one admin-verified or CSV-imported price data point.
// This is deliberately separate from "live market data" (MarketRecord,
// Phase 7) - see master prompt section 18-19. A PriceRecord answers
// "what did admin observe/enter", never "what is the price right now".
//
// Every record must be honestly labeled with its source and date so the
// UI can show "Last updated: [date]" instead of implying real-time data
// (master prompt section 6 - No Fake AI/Data Rule applies to price data
// too: never present demo/manual data as if it were live).

const mongoose = require("mongoose");
const Component = require("./Component");

const priceRecordSchema = new mongoose.Schema(
  {
    componentType: {
      type: String,
      enum: Component.TYPES,
      required: [true, "componentType is required"],
    },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    capacity: { type: String, trim: true },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "unknown"],
      default: "unknown",
    },
    workingStatus: {
      type: String,
      enum: ["VERIFIED_WORKING", "LIKELY_WORKING", "NOT_WORKING", "NOT_TESTED"],
      default: "NOT_TESTED",
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price cannot be negative"],
    },
    currency: { type: String, default: "INR" },
    source: {
      type: String,
      required: [true, "source is required (e.g. 'OLX listing', 'Admin estimate', 'CSV import - marketdata_aug2026.csv')"],
      trim: true,
    },
    sourceUrl: { type: String, trim: true },
    observedDate: {
      // when the price was actually observed/valid, which may differ
      // from createdAt (when it was entered into our system)
      type: Date,
      required: [true, "observedDate is required"],
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    importBatch: {
      // set when created via CSV import, so a whole batch can be traced
      // or, if ever needed, identified/reviewed together
      type: String,
    },
  },
  { timestamps: true }
);

priceRecordSchema.index({ componentType: 1, brand: 1, model: 1 });

module.exports = mongoose.model("PriceRecord", priceRecordSchema);
