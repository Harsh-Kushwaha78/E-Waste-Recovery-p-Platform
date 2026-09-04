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
} = require("../controllers/adminController");

const router = express.Router();

router.use(requireDb, protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.put("/users/:id/role", changeUserRole);
router.get("/audit-logs", listAuditLogs);
router.delete("/listings/:id", adminRemoveListing);

module.exports = router;
