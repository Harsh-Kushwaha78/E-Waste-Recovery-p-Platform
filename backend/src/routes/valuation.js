// backend/src/routes/valuation.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { generateValuation, getLatestValuation, getValuationHistory } = require("../controllers/valuationController");

const router = express.Router();

router.use(requireDb, protect);

router.post("/devices/:deviceId", generateValuation);
router.get("/devices/:deviceId", getLatestValuation);
router.get("/devices/:deviceId/history", getValuationHistory);

module.exports = router;
