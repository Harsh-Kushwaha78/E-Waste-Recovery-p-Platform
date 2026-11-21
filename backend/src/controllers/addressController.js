// backend/src/controllers/addressController.js

const mongoose = require("mongoose");
const Address = require("../models/Address");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function cleanPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== "string") return "";
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  return digits;
}

// POST /api/addresses
async function createAddress(req, res, next) {
  try {
    const {
      fullName,
      phone,
      building,
      street,
      landmark,
      city,
      state,
      pincode,
      label,
      isDefault,
    } = req.body;

    const normalizedPhone = cleanPhone(phone);
    const normalizedPincode = (pincode || "").toString().trim();

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ status: "error", message: "Full name is required." });
    }
    if (!normalizedPhone || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        status: "error",
        message: "A valid 10-digit Indian mobile number is required.",
      });
    }
    if (!building || !building.trim()) {
      return res.status(400).json({ status: "error", message: "Building/flat information is required." });
    }
    if (!street || !street.trim()) {
      return res.status(400).json({ status: "error", message: "Street/locality is required." });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ status: "error", message: "City is required." });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ status: "error", message: "State is required." });
    }
    if (!normalizedPincode || !/^[1-9][0-9]{5}$/.test(normalizedPincode)) {
      return res.status(400).json({
        status: "error",
        message: "A valid 6-digit Indian PIN code is required.",
      });
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = Boolean(isDefault) || existingCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      phone: normalizedPhone,
      building: building.trim(),
      street: street.trim(),
      landmark: (landmark || "").trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: normalizedPincode,
      label: ["Home", "Work", "Other"].includes(label) ? label : "Home",
      isDefault: shouldBeDefault,
    });

    res.status(201).json({ status: "ok", address });
  } catch (err) {
    next(err);
  }
}

// GET /api/addresses
async function listAddresses(req, res, next) {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({ status: "ok", count: addresses.length, addresses });
  } catch (err) {
    next(err);
  }
}

// GET /api/addresses/:id
async function getAddress(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid address ID." });
    }

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address not found, or you do not have permission to view it.",
      });
    }

    res.status(200).json({ status: "ok", address });
  } catch (err) {
    next(err);
  }
}

// PUT /api/addresses/:id
async function updateAddress(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid address ID." });
    }

    const existing = await Address.findOne({ _id: id, user: req.user._id });
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Address not found, or you do not have permission to modify it.",
      });
    }

    const {
      fullName,
      phone,
      building,
      street,
      landmark,
      city,
      state,
      pincode,
      label,
      isDefault,
    } = req.body;

    if (fullName !== undefined) {
      if (!fullName.trim()) return res.status(400).json({ status: "error", message: "Full name cannot be empty." });
      existing.fullName = fullName.trim();
    }
    if (phone !== undefined) {
      const p = cleanPhone(phone);
      if (!/^[6-9]\d{9}$/.test(p)) {
        return res.status(400).json({ status: "error", message: "A valid 10-digit Indian mobile number is required." });
      }
      existing.phone = p;
    }
    if (building !== undefined) {
      if (!building.trim()) return res.status(400).json({ status: "error", message: "Building cannot be empty." });
      existing.building = building.trim();
    }
    if (street !== undefined) {
      if (!street.trim()) return res.status(400).json({ status: "error", message: "Street cannot be empty." });
      existing.street = street.trim();
    }
    if (landmark !== undefined) {
      existing.landmark = landmark ? landmark.trim() : "";
    }
    if (city !== undefined) {
      if (!city.trim()) return res.status(400).json({ status: "error", message: "City cannot be empty." });
      existing.city = city.trim();
    }
    if (state !== undefined) {
      if (!state.trim()) return res.status(400).json({ status: "error", message: "State cannot be empty." });
      existing.state = state.trim();
    }
    if (pincode !== undefined) {
      const pin = pincode.toString().trim();
      if (!/^[1-9][0-9]{5}$/.test(pin)) {
        return res.status(400).json({ status: "error", message: "A valid 6-digit Indian PIN code is required." });
      }
      existing.pincode = pin;
    }
    if (label !== undefined && ["Home", "Work", "Other"].includes(label)) {
      existing.label = label;
    }

    if (isDefault === true) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: existing._id } }, { $set: { isDefault: false } });
      existing.isDefault = true;
    } else if (isDefault === false && existing.isDefault) {
      // If unsetting default, make sure there's at least another address or keep as default
      const other = await Address.findOne({ user: req.user._id, _id: { $ne: existing._id } }).sort({ createdAt: -1 });
      if (other) {
        other.isDefault = true;
        await other.save();
        existing.isDefault = false;
      }
    }

    await existing.save();
    res.status(200).json({ status: "ok", address: existing });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/addresses/:id
async function deleteAddress(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid address ID." });
    }

    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address not found, or you do not have permission to delete it.",
      });
    }

    // If the deleted address was default, promote another address to default
    if (address.isDefault) {
      const nextDefault = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    res.status(200).json({ status: "ok", message: "Address deleted successfully." });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/addresses/:id/default
async function setDefaultAddress(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid address ID." });
    }

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address not found, or you do not have permission to modify it.",
      });
    }

    await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
    address.isDefault = true;
    await address.save();

    res.status(200).json({ status: "ok", address });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAddress,
  listAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  cleanPhone,
};
