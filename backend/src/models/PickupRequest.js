// backend/src/models/PickupRequest.js
//
// PickupRequest model representing a doorstep recycling pickup order.
// Tracks lifecycle statuses: Pending, Accepted, Pickup Scheduled,
// Collected, Completed, Rejected, Cancelled.
// Stores an immutable snapshot of pickup address and quoted valuation.

const mongoose = require("mongoose");

const pickupRequestSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["device", "component", "custom_e_waste"],
      required: true,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
    },
    component: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
    },
    customItemDetails: {
      title: { type: String, trim: true },
      category: { type: String, trim: true },
      condition: { type: String, trim: true },
      approxWeightKg: { type: Number, min: 0 },
      estimatedQuantity: { type: Number, min: 1, default: 1 },
      notes: { type: String, trim: true },
    },
    pickupAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      building: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      label: { type: String, default: "Home" },
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    preferredDate: {
      type: Date,
      required: [true, "Preferred pickup date is required"],
    },
    timeSlot: {
      type: String,
      enum: ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00"],
      required: [true, "Preferred time slot is required"],
    },
    valuationSnapshot: {
      estimatedValue: { type: Number, default: 0 },
      isDemoEstimate: { type: Boolean, default: true },
      scrapEstimate: { type: Number, default: 0 },
      pricingDisclaimer: {
        type: String,
        default:
          "Valuation estimates are based on predictive models and are subject to physical hardware verification upon collection.",
      },
    },
    pickupFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Pickup Scheduled",
        "Collected",
        "Completed",
        "Rejected",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

pickupRequestSchema.index({ user: 1, createdAt: -1 });
pickupRequestSchema.index({ status: 1, preferredDate: 1 });

module.exports = mongoose.model("PickupRequest", pickupRequestSchema);
