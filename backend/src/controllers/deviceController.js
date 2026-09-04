// backend/src/controllers/deviceController.js
//
// All handlers assume `protect` middleware already ran, so req.user
// exists. Every query is scoped to `owner: req.user._id` - a user can
// never read/edit/delete another user's device. This is enforced at the
// query level (not just hidden in the UI), so even a crafted request
// with someone else's device id gets a 404, not their data.

const mongoose = require("mongoose");
const Device = require("../models/Device");
const Component = require("../models/Component");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/devices
async function listDevices(req, res, next) {
  try {
    const devices = await Device.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ status: "ok", count: devices.length, devices });
  } catch (err) {
    next(err);
  }
}

// POST /api/devices
async function createDevice(req, res, next) {
  try {
    const { name, category, brand, model, ageYears, description, overallCondition } =
      req.body;

    if (!name || !category) {
      return res.status(400).json({
        status: "error",
        message: "name and category are required.",
      });
    }

    if (!Device.CATEGORIES.includes(category)) {
      return res.status(400).json({
        status: "error",
        message: `category must be one of: ${Device.CATEGORIES.join(", ")}`,
      });
    }

    const device = await Device.create({
      owner: req.user._id,
      name,
      category,
      brand,
      model,
      ageYears,
      description,
      overallCondition,
    });

    res.status(201).json({ status: "ok", device });
  } catch (err) {
    next(err);
  }
}

// GET /api/devices/:id  (includes its components)
async function getDevice(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: id, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const components = await Component.find({ device: device._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ status: "ok", device, components });
  } catch (err) {
    next(err);
  }
}

// PUT /api/devices/:id
async function updateDevice(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    if (req.body.category && !Device.CATEGORIES.includes(req.body.category)) {
      return res.status(400).json({
        status: "error",
        message: `category must be one of: ${Device.CATEGORIES.join(", ")}`,
      });
    }

    const allowedFields = [
      "name",
      "category",
      "brand",
      "model",
      "ageYears",
      "description",
      "overallCondition",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const device = await Device.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    res.status(200).json({ status: "ok", device });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/devices/:id  (cascades to its components)
async function deleteDevice(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const { deletedCount } = await Component.deleteMany({ device: device._id });

    res.status(200).json({
      status: "ok",
      message: "Device deleted.",
      componentsDeleted: deletedCount,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDevices,
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
};
