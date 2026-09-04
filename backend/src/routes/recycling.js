// backend/src/routes/recycling.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { adminOnly } = require("../middleware/adminOnly");
const { getGuidance, createOption, deleteOption } = require("../controllers/recyclingController");

const router = express.Router();

router.use(requireDb, protect);

router.get("/", getGuidance);
router.post("/options", adminOnly, createOption);
router.delete("/options/:id", adminOnly, deleteOption);

module.exports = router;
