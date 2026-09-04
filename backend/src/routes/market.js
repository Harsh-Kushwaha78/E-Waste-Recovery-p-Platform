// backend/src/routes/market.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { getMarket } = require("../controllers/marketController");

const router = express.Router();

router.use(requireDb, protect);
router.get("/", getMarket);

module.exports = router;
