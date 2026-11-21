// backend/src/models/Address.js
//
// Address model for user shipping and recycling pickup locations.
// Validates 6-digit Indian PIN codes and 10-digit phone numbers.

const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Recipient full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"],
    },
    building: {
      type: String,
      required: [true, "House, flat, or building details are required"],
      trim: true,
      maxlength: [200, "Building details cannot exceed 200 characters"],
    },
    street: {
      type: String,
      required: [true, "Street, area, or locality is required"],
      trim: true,
      maxlength: [200, "Street details cannot exceed 200 characters"],
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [150, "Landmark cannot exceed 150 characters"],
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State cannot exceed 100 characters"],
    },
    pincode: {
      type: String,
      required: [true, "6-digit PIN code is required"],
      trim: true,
      match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"],
    },
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.index({ user: 1, isDefault: -1 });

module.exports = mongoose.model("Address", addressSchema);
