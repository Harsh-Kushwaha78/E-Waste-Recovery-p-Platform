// backend/src/models/Component.js
//
// A Component is a part belonging to a Device (RAM, SSD, Battery, etc).
//
// workingStatus here is the basic manual field for Phase 2. Phase 3 will
// add a separate ComponentTest collection (evidence, test dates, tester
// info) and this field will start being driven by real test results
// rather than the user just picking a value - but the enum stays the
// same so nothing here needs to change later.

const mongoose = require("mongoose");

const COMPONENT_TYPES = [
  "ram",
  "ssd",
  "hdd",
  "battery",
  "motherboard",
  "display",
  "gpu",
  "cooling_fan",
  "wifi_card",
  "charger",
  "keyboard",
  "camera",
  "speaker",
  "other",
];

const WORKING_STATUSES = [
  "VERIFIED_WORKING",
  "LIKELY_WORKING",
  "NOT_WORKING",
  "NOT_TESTED",
];

const componentSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    // Denormalized for convenience/query speed and to make ownership
    // checks a single query instead of a join through Device.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: COMPONENT_TYPES,
      required: [true, "Component type is required"],
    },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    capacity: { type: String, trim: true }, // e.g. "512GB", "8GB" - free text, unit varies by type
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "unknown"],
      default: "unknown",
    },
    workingStatus: {
      type: String,
      enum: WORKING_STATUSES,
      default: "NOT_TESTED",
    },
    // Health as a rough 0-100 percentage. Manual for now (Phase 2);
    // Phase 3 test results may refine this.
    health: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes are too long (max 1000 characters)"],
    },
  },
  { timestamps: true }
);

componentSchema.statics.TYPES = COMPONENT_TYPES;
componentSchema.statics.WORKING_STATUSES = WORKING_STATUSES;

module.exports = mongoose.model("Component", componentSchema);
