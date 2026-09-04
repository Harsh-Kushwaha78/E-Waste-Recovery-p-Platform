// backend/src/models/Listing.js
//
// A Listing makes one of the seller's own tested Components visible to
// other users for purchase. Listings reference the live Component (not
// a snapshot), so its workingStatus/health/condition/evidence always
// reflect the most recent test - a seller cannot "freeze" a fake good
// status by listing it.

const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    component: { type: mongoose.Schema.Types.ObjectId, ref: "Component", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["active", "sold", "removed"],
      default: "active",
    },
  },
  { timestamps: true }
);

listingSchema.index({ status: 1, price: 1 });

module.exports = mongoose.model("Listing", listingSchema);
