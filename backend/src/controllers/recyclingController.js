// backend/src/controllers/recyclingController.js

const mongoose = require("mongoose");
const RecyclingOption = require("../models/RecyclingOption");
const Component = require("../models/Component");
const { classifyForRecycling } = require("../utils/classifyForRecycling");
const { logEvent } = require("../utils/auditLog");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/recycling?componentType=battery
async function getGuidance(req, res, next) {
  try {
    const { componentType } = req.query;
    if (!componentType) {
      return res.status(400).json({ status: "error", message: "componentType query param is required." });
    }
    if (!Component.TYPES.includes(componentType)) {
      return res.status(400).json({
        status: "error",
        message: `componentType must be one of: ${Component.TYPES.join(", ")}`,
      });
    }

    const classification = classifyForRecycling(componentType);
    const localOptions = await RecyclingOption.find({ category: classification.category }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "ok",
      componentType,
      classification,
      localOptions,
      localOptionsNote:
        localOptions.length === 0
          ? "No admin-entered local drop-off points for this category yet. Search for a certified e-waste recycler in your area."
          : undefined,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/recycling/options (admin only)
async function createOption(req, res, next) {
  try {
    const { category, recyclerName, address, contact, notes } = req.body;

    if (!category || !["hazardous", "e_waste_recyclable", "general_recyclable"].includes(category)) {
      return res.status(400).json({
        status: "error",
        message: "category is required and must be one of: hazardous, e_waste_recyclable, general_recyclable",
      });
    }
    if (!recyclerName) {
      return res.status(400).json({ status: "error", message: "recyclerName is required." });
    }

    const option = await RecyclingOption.create({
      category,
      recyclerName,
      address,
      contact,
      notes,
      addedBy: req.user._id,
    });

    await logEvent(req.user, "recycling_option.created", {
      targetType: "RecyclingOption",
      targetId: option._id,
      metadata: { category, recyclerName },
    });

    res.status(201).json({ status: "ok", option });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/recycling/options/:id (admin only)
async function deleteOption(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid option id." });
    }

    const option = await RecyclingOption.findByIdAndDelete(id);
    if (!option) {
      return res.status(404).json({ status: "error", message: "Recycling option not found." });
    }

    res.status(200).json({ status: "ok", message: "Recycling option deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGuidance, createOption, deleteOption };
