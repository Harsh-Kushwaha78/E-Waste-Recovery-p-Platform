// backend/src/controllers/cvController.js

const mongoose = require("mongoose");
const Device = require("../models/Device");
const { detectComponents, CvServiceUnavailableError } = require("../services/cvServiceClient");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/cv/devices/:deviceId/analyze
// Uploads an image for a device and returns demo component suggestions.
// Does NOT create any components itself - per the master flow, the user
// must confirm each suggestion via the normal
// POST /api/devices/:deviceId/components endpoint from Phase 2.
async function analyzeImage(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No image uploaded. Send as multipart/form-data field 'image'.",
      });
    }

    let cvResult;
    try {
      cvResult = await detectComponents(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } catch (err) {
      if (err instanceof CvServiceUnavailableError) {
        return res.status(503).json({
          status: "error",
          message:
            "Computer vision service is unavailable. You can still add components manually.",
        });
      }
      return res.status(err.status || 500).json({
        status: "error",
        message: err.message,
        details: err.cvServiceError,
      });
    }

    res.status(200).json({ status: "ok", ...cvResult });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeImage };
