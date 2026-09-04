// backend/src/routes/listings.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const {
  createListing,
  listListings,
  getListing,
  updateListing,
  deleteListing,
  myListings,
} = require("../controllers/listingController");

const router = express.Router();

router.use(requireDb, protect);

router.get("/mine", myListings);
router.get("/", listListings);
router.post("/", createListing);
router.get("/:id", getListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

module.exports = router;
