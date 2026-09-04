// backend/src/routes/prices.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const { adminOnly } = require("../middleware/adminOnly");
const { csvUpload } = require("../middleware/csvUpload");
const {
  listPrices,
  createPrice,
  updatePrice,
  deletePrice,
  importCsv,
} = require("../controllers/priceController");

const router = express.Router();

router.use(requireDb, protect);

// Any authenticated user can view price data.
router.get("/", listPrices);

// Only admins can create/edit/delete/import price data.
router.post("/", adminOnly, createPrice);
router.put("/:id", adminOnly, updatePrice);
router.delete("/:id", adminOnly, deletePrice);

router.post("/import", adminOnly, (req, res, next) => {
  csvUpload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
    next();
  });
}, importCsv);

module.exports = router;
