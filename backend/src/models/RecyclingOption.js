// backend/src/models/RecyclingOption.js
//
// Admin-entered local recycler/drop-off info, separate from the static
// rule-based guidance in classifyForRecycling.js. No real recycler
// directory API is integrated - this is the manual fallback, same
// pattern as PriceRecord (Phase 4).

const mongoose = require("mongoose");

const recyclingOptionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["hazardous", "e_waste_recyclable", "general_recyclable"],
      required: true,
    },
    recyclerName: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    contact: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecyclingOption", recyclingOptionSchema);
