// backend/src/controllers/listingController.js

const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const Component = require("../models/Component");
const ComponentTest = require("../models/ComponentTest");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/listings
async function createListing(req, res, next) {
  try {
    const { componentId, title, description, price } = req.body;

    if (!componentId || !isValidId(componentId)) {
      return res.status(400).json({ status: "error", message: "Valid componentId is required." });
    }
    if (!title) {
      return res.status(400).json({ status: "error", message: "title is required." });
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({ status: "error", message: "price is required and must be non-negative." });
    }

    const component = await Component.findOne({ _id: componentId, owner: req.user._id });
    if (!component) {
      return res.status(404).json({
        status: "error",
        message: "Component not found, or you don't own it.",
      });
    }

    const existingActive = await Listing.findOne({ component: componentId, status: "active" });
    if (existingActive) {
      return res.status(409).json({
        status: "error",
        message: "This component already has an active listing.",
      });
    }

    const listing = await Listing.create({
      component: componentId,
      seller: req.user._id,
      title,
      description,
      price,
    });

    res.status(201).json({ status: "ok", listing });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings?componentType=ssd&minPrice=&maxPrice=&workingStatus=&sort=price_asc
async function listListings(req, res, next) {
  try {
    const { componentType, minPrice, maxPrice, workingStatus, sort, limit } = req.query;

    const query = { status: "active" };
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length > 0) query.price = priceFilter;

    let listings = await Listing.find(query)
      .populate({
        path: "component",
        select: "type brand model capacity condition workingStatus health",
      })
      .populate({ path: "seller", select: "name" })
      .limit(Math.min(Number(limit) || 50, 200));

    if (componentType) {
      listings = listings.filter((l) => l.component?.type === componentType);
    }
    if (workingStatus) {
      listings = listings.filter((l) => l.component?.workingStatus === workingStatus);
    }

    if (sort === "price_asc") listings.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") listings.sort((a, b) => b.price - a.price);
    else listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ status: "ok", count: listings.length, listings });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/:id
async function getListing(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid listing id." });
    }

    const listing = await Listing.findById(id)
      .populate({ path: "component" })
      .populate({ path: "seller", select: "name createdAt" });

    if (!listing) {
      return res.status(404).json({ status: "error", message: "Listing not found." });
    }

    const latestTest = await ComponentTest.findOne({ component: listing.component._id }).sort({
      testDate: -1,
    });

    res.status(200).json({ status: "ok", listing, latestTest: latestTest || null });
  } catch (err) {
    next(err);
  }
}

// PUT /api/listings/:id - only the seller
async function updateListing(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid listing id." });
    }

    const allowedFields = ["title", "description", "price", "status"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.status && !["active", "sold", "removed"].includes(updates.status)) {
      return res.status(400).json({ status: "error", message: "Invalid status value." });
    }

    const listing = await Listing.findOneAndUpdate(
      { _id: id, seller: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).json({ status: "error", message: "Listing not found, or you're not the seller." });
    }

    res.status(200).json({ status: "ok", listing });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/listings/:id - only the seller
async function deleteListing(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid listing id." });
    }

    const listing = await Listing.findOneAndDelete({ _id: id, seller: req.user._id });
    if (!listing) {
      return res.status(404).json({ status: "error", message: "Listing not found, or you're not the seller." });
    }

    res.status(200).json({ status: "ok", message: "Listing deleted." });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/mine - seller's own listings, any status
async function myListings(req, res, next) {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate({ path: "component", select: "type brand model workingStatus" })
      .sort({ createdAt: -1 });

    res.status(200).json({ status: "ok", count: listings.length, listings });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createListing,
  listListings,
  getListing,
  updateListing,
  deleteListing,
  myListings,
};
