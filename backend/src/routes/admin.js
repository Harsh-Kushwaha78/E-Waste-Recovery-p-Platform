// backend/src/routes/admin.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { adminOnly } = require("../middleware/adminOnly");
const {
  getStats,
  listUsers,
  changeUserRole,
  listAuditLogs,
  adminRemoveListing,
  adminListOrders,
} = require("../controllers/adminController");
const {
  adminListPickups,
  adminUpdatePickupStatus,
} = require("../controllers/pickupController");

const router = express.Router();

router.use(requireDb, protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.put("/users/:id/role", changeUserRole);
router.get("/audit-logs", listAuditLogs);
router.delete("/listings/:id", adminRemoveListing);

// Admin order and pickup management
router.get("/orders", adminListOrders);
router.get("/pickups", adminListPickups);
router.patch("/pickups/:id/status", adminUpdatePickupStatus);

module.exports = router;
