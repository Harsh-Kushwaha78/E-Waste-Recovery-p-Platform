// backend/src/routes/devices.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const {
  listDevices,
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
} = require("../controllers/deviceController");
const {
  listComponents,
  createComponent,
} = require("../controllers/componentController");

const router = express.Router();

// Every route here requires DB + auth.
router.use(requireDb, protect);

router.get("/", listDevices);
router.post("/", createDevice);
router.get("/:id", getDevice);
router.put("/:id", updateDevice);
router.delete("/:id", deleteDevice);

// Nested component routes - a component always belongs to a device, so
// creating/listing happens through the device's own URL.
router.get("/:deviceId/components", listComponents);
router.post("/:deviceId/components", createComponent);

module.exports = router;
