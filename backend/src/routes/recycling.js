// backend/src/routes/recycling.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { adminOnly } = require("../middleware/adminOnly");
const {
  getGuidance,
  createOption,
  deleteOption,
} = require("../controllers/recyclingController");
const {
  getServiceability,
  createPickupRequest,
  listMyPickups,
  getPickup,
  cancelMyPickup,
} = require("../controllers/pickupController");

const router = express.Router();

router.use(requireDb, protect);

// Drop-off directory & guidance
router.get("/", getGuidance);
router.post("/options", adminOnly, createOption);
router.delete("/options/:id", adminOnly, deleteOption);

// Doorstep pickup endpoints
router.get("/serviceability", getServiceability);
router.post("/pickups", createPickupRequest);
router.get("/pickups/mine", listMyPickups);
router.get("/pickups/:id", getPickup);
router.patch("/pickups/:id/cancel", cancelMyPickup);

module.exports = router;
