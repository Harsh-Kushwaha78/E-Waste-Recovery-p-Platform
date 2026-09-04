// backend/src/models/Device.js
//
// A Device is the non-working electronic item the user is trying to
// recover value from (e.g. "Dell Inspiron 15", "iPhone 8"). Components
// (Phase 2 also) belong to a Device via a reference.
//
// Fields here are intentionally simple/manual for the MVP - no CV, no
// image analysis yet (that's Phase 6). The user just describes what they
// have.

const mongoose = require("mongoose");

const DEVICE_CATEGORIES = [
  "laptop",
  "desktop",
  "smartphone",
  "tablet",
  "monitor",
  "printer",
  "television",
  "other",
];

const deviceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Device name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: DEVICE_CATEGORIES,
      required: [true, "Device category is required"],
    },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    ageYears: {
      type: Number,
      min: [0, "Age cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description is too long (max 2000 characters)"],
    },
    // Overall device-level status, distinct from per-component working
    // status (Phase 3). This just describes why the user has it here.
    overallCondition: {
      type: String,
      enum: ["non_functional", "partially_functional", "unknown"],
      default: "unknown",
    },
  },
  { timestamps: true }
);

deviceSchema.statics.CATEGORIES = DEVICE_CATEGORIES;

module.exports = mongoose.model("Device", deviceSchema);
