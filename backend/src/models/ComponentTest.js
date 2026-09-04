// backend/src/models/ComponentTest.js
//
// A ComponentTest is one testing event for a Component - what was
// actually observed, when, by whom, and what status that observation
// implies (via deriveWorkingStatus). This is the evidence backing the
// Component's workingStatus (see master prompt section 11 - Evidence
// System, section 12 - Trust System).
//
// `results` is intentionally a flexible object because each component
// type has different relevant fields (RAM cares about memory tests,
// Battery cares about swelling/charge, etc) - see deriveWorkingStatus.js
// for the exact fields read per type.

const mongoose = require("mongoose");

const componentTestSchema = new mongoose.Schema(
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
    componentType: {
      // snapshotted at test time so history remains meaningful even if
      // the component's type field is ever edited
      type: String,
      required: true,
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    derivedStatus: {
      type: String,
      enum: ["VERIFIED_WORKING", "LIKELY_WORKING", "NOT_WORKING", "NOT_TESTED"],
      required: true,
    },
    derivedReasons: {
      type: [String],
      default: [],
    },
    evidenceNotes: {
      type: String,
      trim: true,
      maxlength: [2000, "Evidence notes are too long (max 2000 characters)"],
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    testedBy: {
      // denormalized name at test time, for display without a join
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ComponentTest", componentTestSchema);
