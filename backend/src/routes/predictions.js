// backend/src/routes/predictions.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const {
  predictForComponent,
  listPredictionsForComponent,
  getWhyThisPrice,
} = require("../controllers/predictionController");

const router = express.Router();

router.use(requireDb, protect);

router.post("/components/:id", predictForComponent);
router.get("/components/:id", listPredictionsForComponent);
router.get("/components/:id/why", getWhyThisPrice);

module.exports = router;
