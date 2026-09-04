// backend/src/controllers/adminController.js

const mongoose = require("mongoose");
const User = require("../models/User");
const Device = require("../models/Device");
const Component = require("../models/Component");
const ComponentTest = require("../models/ComponentTest");
const Listing = require("../models/Listing");
const Valuation = require("../models/Valuation");
const PriceRecord = require("../models/PriceRecord");
const AuditLog = require("../models/AuditLog");
const { logEvent } = require("../utils/auditLog");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const [
      userCount,
      deviceCount,
      componentCount,
      testCount,
      activeListingCount,
      valuationCount,
      priceRecordCount,
      notWorkingCount,
    ] = await Promise.all([
      User.countDocuments(),
      Device.countDocuments(),
      Component.countDocuments(),
      ComponentTest.countDocuments(),
      Listing.countDocuments({ status: "active" }),
      Valuation.countDocuments(),
      PriceRecord.countDocuments(),
      Component.countDocuments({ workingStatus: "NOT_WORKING" }),
    ]);

    res.status(200).json({
      status: "ok",
      stats: {
        users: userCount,
        devices: deviceCount,
        components: componentCount,
        componentsNotWorking: notWorkingCount,
        testsPerformed: testCount,
        activeListings: activeListingCount,
        valuationsGenerated: valuationCount,
        priceRecords: priceRecordCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users
async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", count: users.length, users });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id/role
async function changeUserRole(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid user id." });
    }

    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ status: "error", message: "role must be 'user' or 'admin'." });
    }

    if (id === String(req.user._id) && role === "user") {
      return res.status(400).json({
        status: "error",
        message: "You cannot demote yourself. Ask another admin to do this.",
      });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    await logEvent(req.user, "user.role_changed", {
      targetType: "User",
      targetId: user._id,
      metadata: { newRole: role, targetEmail: user.email },
    });

    res.status(200).json({ status: "ok", user });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/audit-logs
async function listAuditLogs(req, res, next) {
  try {
    const { limit } = req.query;
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.status(200).json({ status: "ok", count: logs.length, logs });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/listings/:id
async function adminRemoveListing(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid listing id." });
    }

    const listing = await Listing.findByIdAndUpdate(id, { status: "removed" }, { new: true });
    if (!listing) {
      return res.status(404).json({ status: "error", message: "Listing not found." });
    }

    await logEvent(req.user, "listing.admin_removed", {
      targetType: "Listing",
      targetId: listing._id,
    });

    res.status(200).json({ status: "ok", listing });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, listUsers, changeUserRole, listAuditLogs, adminRemoveListing };
