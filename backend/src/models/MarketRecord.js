// backend/src/models/MarketRecord.js
//
// Distinct from PriceRecord (Phase 4, admin-entered/CSV-imported
// historical data). A MarketRecord represents a data point fetched from
// a live market source (see master prompt section 18-19: three
// different price types must stay distinct). No live provider is wired
// up yet (see marketDataService.js) - this model exists so the schema
// is ready the moment one is.

const mongoose = require("mongoose");
const Component = require("./Component");

const marketRecordSchema = new mongoose.Schema(
  {
    componentType: { type: String, enum: Component.TYPES, required: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    sourceProvider: { type: String, required: true },
    sourceUrl: { type: String, trim: true },
    fetchedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

marketRecordSchema.index({ componentType: 1, brand: 1 });

module.exports = mongoose.model("MarketRecord", marketRecordSchema);
