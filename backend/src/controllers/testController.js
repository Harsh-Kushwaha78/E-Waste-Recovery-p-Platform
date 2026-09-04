// backend/src/controllers/testController.js
//
// Submitting a test does two things atomically-ish (two writes, but the
// second is derived purely from the first so a partial failure just
// means the component's status lags one test behind, not corrupted
// data):
//   1. Create a ComponentTest record (the evidence).
//   2. Update the Component's workingStatus to match the derived result.
//
// This keeps Component.workingStatus always backed by its most recent
// test, per the Trust System principle: users cannot just declare a
// component "verified" with no evidence behind it.

const mongoose = require("mongoose");
const Component = require("../models/Component");
const ComponentTest = require("../models/ComponentTest");
const { deriveWorkingStatus } = require("../utils/deriveWorkingStatus");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/components/:id/tests
async function createTest(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    const component = await Component.findOne({ _id: id, owner: req.user._id });
    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    const { results, evidenceNotes } = req.body;

    const { status: derivedStatus, reasons: derivedReasons } = deriveWorkingStatus(
      component.type,
      results
    );

    const test = await ComponentTest.create({
      component: component._id,
      owner: req.user._id,
      componentType: component.type,
      results: results || {},
      derivedStatus,
      derivedReasons,
      evidenceNotes,
      testedBy: req.user.name,
    });

    // Update the component's health from the observed value when the test
    // provided one (batteries and storage report a health percentage).
    const componentUpdates = { workingStatus: derivedStatus };
    if (results) {
      if (typeof results.healthPercent === "number") {
        componentUpdates.health = results.healthPercent;
      } else if (typeof results.smartHealthPercent === "number") {
        componentUpdates.health = results.smartHealthPercent;
      }
    }

    const updatedComponent = await Component.findByIdAndUpdate(
      component._id,
      componentUpdates,
      { new: true, runValidators: true }
    );

    res.status(201).json({ status: "ok", test, component: updatedComponent });
  } catch (err) {
    next(err);
  }
}

// GET /api/components/:id/tests
async function listTests(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    const component = await Component.findOne({ _id: id, owner: req.user._id });
    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    const tests = await ComponentTest.find({ component: id }).sort({ testDate: -1 });

    res.status(200).json({ status: "ok", count: tests.length, tests });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTest, listTests };
