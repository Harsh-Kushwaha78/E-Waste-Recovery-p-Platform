// backend/src/routes/components.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const {
  getComponent,
  updateComponent,
  deleteComponent,
} = require("../controllers/componentController");
const { createTest, listTests } = require("../controllers/testController");

const router = express.Router();

router.use(requireDb, protect);

router.get("/:id", getComponent);
router.put("/:id", updateComponent);
router.delete("/:id", deleteComponent);

router.get("/:id/tests", listTests);
router.post("/:id/tests", createTest);

module.exports = router;
