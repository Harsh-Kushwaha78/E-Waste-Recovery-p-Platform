// backend/src/controllers/componentController.js
//
// Components are nested under a device (/api/devices/:deviceId/components)
// for create/list, and have their own top-level routes for get/update/
// delete by component id (/api/components/:id), since a component id
// alone is enough to look it up. Ownership is always re-checked, never
// assumed from the device lookup alone.

const mongoose = require("mongoose");
const Device = require("../models/Device");
const Component = require("../models/Component");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/devices/:deviceId/components
async function listComponents(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const components = await Component.find({ device: deviceId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ status: "ok", count: components.length, components });
  } catch (err) {
    next(err);
  }
}

// POST /api/devices/:deviceId/components
async function createComponent(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const { type, brand, model, capacity, condition, workingStatus, health, notes } =
      req.body;

    if (!type) {
      return res.status(400).json({ status: "error", message: "type is required." });
    }
    if (!Component.TYPES.includes(type)) {
      return res.status(400).json({
        status: "error",
        message: `type must be one of: ${Component.TYPES.join(", ")}`,
      });
    }
    if (workingStatus && !Component.WORKING_STATUSES.includes(workingStatus)) {
      return res.status(400).json({
        status: "error",
        message: `workingStatus must be one of: ${Component.WORKING_STATUSES.join(", ")}`,
      });
    }

    const component = await Component.create({
      device: deviceId,
      owner: req.user._id,
      type,
      brand,
      model,
      capacity,
      condition,
      workingStatus,
      health,
      notes,
    });

    res.status(201).json({ status: "ok", component });
  } catch (err) {
    next(err);
  }
}

// GET /api/components/:id
async function getComponent(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    const component = await Component.findOne({ _id: id, owner: req.user._id });
    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    res.status(200).json({ status: "ok", component });
  } catch (err) {
    next(err);
  }
}

// PUT /api/components/:id
async function updateComponent(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    if (req.body.type && !Component.TYPES.includes(req.body.type)) {
      return res.status(400).json({
        status: "error",
        message: `type must be one of: ${Component.TYPES.join(", ")}`,
      });
    }
    if (
      req.body.workingStatus &&
      !Component.WORKING_STATUSES.includes(req.body.workingStatus)
    ) {
      return res.status(400).json({
        status: "error",
        message: `workingStatus must be one of: ${Component.WORKING_STATUSES.join(", ")}`,
      });
    }

    const allowedFields = [
      "type",
      "brand",
      "model",
      "capacity",
      "condition",
      "workingStatus",
      "health",
      "notes",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const component = await Component.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    res.status(200).json({ status: "ok", component });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/components/:id
async function deleteComponent(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid component id." });
    }

    const component = await Component.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!component) {
      return res.status(404).json({ status: "error", message: "Component not found." });
    }

    res.status(200).json({ status: "ok", message: "Component deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listComponents,
  createComponent,
  getComponent,
  updateComponent,
  deleteComponent,
};
