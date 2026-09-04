// backend/src/routes/cv.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { imageUpload } = require("../middleware/imageUpload");
const { analyzeImage } = require("../controllers/cvController");

const router = express.Router();

router.use(requireDb, protect);

router.post(
  "/devices/:deviceId/analyze",
  (req, res, next) => {
    imageUpload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: "error", message: err.message });
      }
      next();
    });
  },
  analyzeImage
);

module.exports = router;
