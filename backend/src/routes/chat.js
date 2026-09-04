// backend/src/routes/chat.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { sendMessage, getHistory } = require("../controllers/chatController");

const router = express.Router();

router.use(requireDb, protect);

router.post("/devices/:deviceId", sendMessage);
router.get("/devices/:deviceId", getHistory);

module.exports = router;
