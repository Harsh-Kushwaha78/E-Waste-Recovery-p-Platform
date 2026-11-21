// backend/src/controllers/pickupController.js

const mongoose = require("mongoose");
const PickupRequest = require("../models/PickupRequest");
const Device = require("../models/Device");
const Component = require("../models/Component");
const Address = require("../models/Address");
const { checkPincodeServiceability } = require("../config/serviceablePincodes");
const { estimateScrapValue } = require("../utils/estimateScrapValue");
const { logEvent } = require("../utils/auditLog");
const { cleanPhone } = require("./addressController");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function generatePickupReference() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `PCK-${timePart}-${randomPart}`;
}

// GET /api/recycling/serviceability?pincode=560001
function getServiceability(req, res) {
  const { pincode } = req.query;
  const result = checkPincodeServiceability(pincode);
  res.status(200).json({ status: "ok", ...result });
}

// POST /api/recycling/pickups
async function createPickupRequest(req, res, next) {
  try {
    const {
      itemType,
      deviceId,
      componentId,
      customItemDetails,
      addressId,
      pickupAddress,
      instructions,
      preferredDate,
      timeSlot,
      valuationSnapshot,
    } = req.body;

    if (!itemType || !["device", "component", "custom_e_waste"].includes(itemType)) {
      return res.status(400).json({
        status: "error",
        message: "itemType must be 'device', 'component', or 'custom_e_waste'.",
      });
    }

    let linkedDevice = null;
    let linkedComponent = null;

    if (itemType === "device") {
      if (!deviceId || !isValidId(deviceId)) {
        return res.status(400).json({ status: "error", message: "Valid deviceId is required for device pickup." });
      }
      linkedDevice = await Device.findOne({ _id: deviceId, owner: req.user._id });
      if (!linkedDevice) {
        return res.status(404).json({ status: "error", message: "Device not found, or you do not own it." });
      }
    } else if (itemType === "component") {
      if (!componentId || !isValidId(componentId)) {
        return res.status(400).json({ status: "error", message: "Valid componentId is required for component pickup." });
      }
      linkedComponent = await Component.findOne({ _id: componentId, owner: req.user._id });
      if (!linkedComponent) {
        return res.status(404).json({ status: "error", message: "Component not found, or you do not own it." });
      }
    } else if (itemType === "custom_e_waste") {
      if (!customItemDetails || !customItemDetails.title || !customItemDetails.title.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Title and details are required for custom e-waste pickup.",
        });
      }
    }

    // Resolve address
    let addressSnapshot = null;
    if (addressId) {
      if (!isValidId(addressId)) {
        return res.status(400).json({ status: "error", message: "Invalid addressId." });
      }
      const saved = await Address.findOne({ _id: addressId, user: req.user._id });
      if (!saved) {
        return res.status(400).json({ status: "error", message: "Saved address not found or not owned by you." });
      }
      addressSnapshot = {
        fullName: saved.fullName,
        phone: saved.phone,
        building: saved.building,
        street: saved.street,
        landmark: saved.landmark || "",
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
        label: saved.label || "Home",
      };
    } else if (pickupAddress && typeof pickupAddress === "object") {
      const { fullName, phone, building, street, landmark, city, state, pincode, label } =
        pickupAddress;
      const normalizedPhone = cleanPhone(phone);
      const normalizedPincode = (pincode || "").toString().trim();

      if (!fullName || !fullName.trim()) return res.status(400).json({ status: "error", message: "Recipient name is required." });
      if (!normalizedPhone || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
        return res.status(400).json({ status: "error", message: "A valid 10-digit Indian mobile number is required." });
      }
      if (!building || !building.trim()) return res.status(400).json({ status: "error", message: "Building is required." });
      if (!street || !street.trim()) return res.status(400).json({ status: "error", message: "Street is required." });
      if (!city || !city.trim()) return res.status(400).json({ status: "error", message: "City is required." });
      if (!state || !state.trim()) return res.status(400).json({ status: "error", message: "State is required." });
      if (!normalizedPincode || !/^[1-9][0-9]{5}$/.test(normalizedPincode)) {
        return res.status(400).json({ status: "error", message: "A valid 6-digit Indian PIN code is required." });
      }

      addressSnapshot = {
        fullName: fullName.trim(),
        phone: normalizedPhone,
        building: building.trim(),
        street: street.trim(),
        landmark: (landmark || "").trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: normalizedPincode,
        label: ["Home", "Work", "Other"].includes(label) ? label : "Home",
      };
    } else {
      return res.status(400).json({
        status: "error",
        message: "Pickup address is required (either addressId or pickupAddress object).",
      });
    }

    // Verify PIN code serviceability
    const serviceCheck = checkPincodeServiceability(addressSnapshot.pincode);
    if (!serviceCheck.serviceable) {
      return res.status(400).json({
        status: "error",
        message: serviceCheck.message,
        pincode: addressSnapshot.pincode,
      });
    }

    // Preferred date validation
    if (!preferredDate) {
      return res.status(400).json({ status: "error", message: "Preferred pickup date is required." });
    }
    const pickupDate = new Date(preferredDate);
    if (Number.isNaN(pickupDate.getTime())) {
      return res.status(400).json({ status: "error", message: "Invalid preferred pickup date." });
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (pickupDate < startOfToday) {
      return res.status(400).json({ status: "error", message: "Preferred pickup date cannot be in the past." });
    }

    // Time slot validation
    const allowedSlots = ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00"];
    if (!timeSlot || !allowedSlots.includes(timeSlot)) {
      return res.status(400).json({
        status: "error",
        message: `timeSlot must be one of: ${allowedSlots.join(", ")}`,
      });
    }

    // Compute or capture valuation snapshot
    let finalValuation = {
      estimatedValue: 0,
      isDemoEstimate: true,
      scrapEstimate: 0,
      pricingDisclaimer:
        "Demo/predictive estimate for scrap & recovery value. Payout/settlement (if applicable) is determined after physical diagnostic inspection at the collection center.",
    };

    if (linkedComponent) {
      const scrap = estimateScrapValue(linkedComponent.type);
      finalValuation.scrapEstimate = scrap;
      finalValuation.estimatedValue = scrap;
    } else if (valuationSnapshot && typeof valuationSnapshot === "object") {
      finalValuation.estimatedValue = Number(valuationSnapshot.estimatedValue) || 0;
      finalValuation.scrapEstimate = Number(valuationSnapshot.scrapEstimate) || 0;
      finalValuation.isDemoEstimate = Boolean(valuationSnapshot.isDemoEstimate ?? true);
      if (valuationSnapshot.pricingDisclaimer) {
        finalValuation.pricingDisclaimer = String(valuationSnapshot.pricingDisclaimer);
      }
    }

    const referenceId = generatePickupReference();

    const pickup = await PickupRequest.create({
      referenceId,
      user: req.user._id,
      itemType,
      device: linkedDevice ? linkedDevice._id : undefined,
      component: linkedComponent ? linkedComponent._id : undefined,
      customItemDetails: itemType === "custom_e_waste" ? customItemDetails : undefined,
      pickupAddress: addressSnapshot,
      instructions: (instructions || "").trim(),
      preferredDate: pickupDate,
      timeSlot,
      valuationSnapshot: finalValuation,
      pickupFee: 0, // Transparent free recycling collection promotion
      status: "Pending",
      statusHistory: [
        {
          status: "Pending",
          changedAt: new Date(),
          changedBy: req.user._id,
          note: "Pickup request created by user.",
        },
      ],
    });

    await logEvent(req.user, "pickup.created", {
      targetType: "PickupRequest",
      targetId: pickup._id,
      metadata: {
        referenceId,
        itemType,
        pincode: addressSnapshot.pincode,
        preferredDate: pickupDate.toISOString(),
      },
    });

    res.status(201).json({
      status: "ok",
      pickup,
      message: "Recycling pickup request submitted successfully. You can track its status using your reference ID.",
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/recycling/pickups/mine
async function listMyPickups(req, res, next) {
  try {
    const pickups = await PickupRequest.find({ user: req.user._id })
      .populate("device", "name category brand model")
      .populate("component", "type brand model workingStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({ status: "ok", count: pickups.length, pickups });
  } catch (err) {
    next(err);
  }
}

// GET /api/recycling/pickups/:id
async function getPickup(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid pickup ID." });
    }

    const pickup = await PickupRequest.findById(id)
      .populate("user", "name email")
      .populate("device")
      .populate("component");

    if (!pickup) {
      return res.status(404).json({ status: "error", message: "Pickup request not found." });
    }

    const isOwner = pickup.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to view this pickup request.",
      });
    }

    res.status(200).json({ status: "ok", pickup });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/recycling/pickups/:id/cancel
async function cancelMyPickup(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid pickup ID." });
    }

    const pickup = await PickupRequest.findOne({ _id: id, user: req.user._id });
    if (!pickup) {
      return res.status(404).json({ status: "error", message: "Pickup request not found or not owned by you." });
    }

    if (!["Pending", "Accepted"].includes(pickup.status)) {
      return res.status(400).json({
        status: "error",
        message: `Cannot cancel pickup request in status '${pickup.status}'. Contact support if already scheduled or in transit.`,
      });
    }

    pickup.status = "Cancelled";
    pickup.statusHistory.push({
      status: "Cancelled",
      changedAt: new Date(),
      changedBy: req.user._id,
      note: reason ? String(reason).trim() : "Cancelled by user.",
    });

    await pickup.save();

    await logEvent(req.user, "pickup.cancelled", {
      targetType: "PickupRequest",
      targetId: pickup._id,
      metadata: { referenceId: pickup.referenceId, reason },
    });

    res.status(200).json({ status: "ok", pickup });
  } catch (err) {
    next(err);
  }
}

// Admin: GET /api/admin/pickups
async function adminListPickups(req, res, next) {
  try {
    const { status, limit } = req.query;
    const query = {};
    if (status) query.status = status;

    const pickups = await PickupRequest.find(query)
      .populate("user", "name email")
      .populate("device", "name category brand model")
      .populate("component", "type brand model")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 300));

    res.status(200).json({ status: "ok", count: pickups.length, pickups });
  } catch (err) {
    next(err);
  }
}

// Admin: PATCH /api/admin/pickups/:id/status
async function adminUpdatePickupStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid pickup ID." });
    }

    const validStatuses = [
      "Pending",
      "Accepted",
      "Pickup Scheduled",
      "Collected",
      "Completed",
      "Rejected",
      "Cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const pickup = await PickupRequest.findById(id);
    if (!pickup) {
      return res.status(404).json({ status: "error", message: "Pickup request not found." });
    }

    if (pickup.status === status) {
      return res.status(400).json({ status: "error", message: `Pickup is already in status '${status}'.` });
    }

    // Terminal status checks
    if (["Completed", "Cancelled", "Rejected"].includes(pickup.status)) {
      return res.status(400).json({
        status: "error",
        message: `Cannot change status of a pickup in terminal state '${pickup.status}'.`,
      });
    }

    pickup.status = status;
    pickup.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: note ? String(note).trim() : `Status updated to ${status} by admin`,
    });

    await pickup.save();

    await logEvent(req.user, "pickup.status_updated", {
      targetType: "PickupRequest",
      targetId: pickup._id,
      metadata: { referenceId: pickup.referenceId, newStatus: status, note },
    });

    res.status(200).json({ status: "ok", pickup });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getServiceability,
  createPickupRequest,
  listMyPickups,
  getPickup,
  cancelMyPickup,
  adminListPickups,
  adminUpdatePickupStatus,
  generatePickupReference,
};
