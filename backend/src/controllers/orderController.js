// backend/src/controllers/orderController.js

const mongoose = require("mongoose");
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const Address = require("../models/Address");
const { logEvent } = require("../utils/auditLog");
const { cleanPhone } = require("./addressController");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function generateOrderReference() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timePart}-${randomPart}`;
}

// POST /api/orders
// Atomic marketplace checkout
async function createOrder(req, res, next) {
  let reservedListing = null;

  try {
    const { listingId, addressId, shippingAddress, saveAddress } = req.body;

    if (!listingId || !isValidId(listingId)) {
      return res.status(400).json({ status: "error", message: "A valid listingId is required." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ status: "error", message: "Listing not found." });
    }

    // Prevent self-purchase
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You cannot purchase your own listing.",
      });
    }

    if (listing.status !== "active") {
      return res.status(409).json({
        status: "error",
        message: `This listing is not available for purchase (status: ${listing.status}).`,
      });
    }

    // Resolve shipping address
    let addressSnapshot = null;

    if (addressId) {
      if (!isValidId(addressId)) {
        return res.status(400).json({ status: "error", message: "Invalid addressId." });
      }
      const savedAddress = await Address.findOne({ _id: addressId, user: req.user._id });
      if (!savedAddress) {
        return res.status(400).json({
          status: "error",
          message: "Selected address not found or does not belong to you.",
        });
      }
      addressSnapshot = {
        fullName: savedAddress.fullName,
        phone: savedAddress.phone,
        building: savedAddress.building,
        street: savedAddress.street,
        landmark: savedAddress.landmark || "",
        city: savedAddress.city,
        state: savedAddress.state,
        pincode: savedAddress.pincode,
        label: savedAddress.label || "Home",
      };
    } else if (shippingAddress && typeof shippingAddress === "object") {
      const { fullName, phone, building, street, landmark, city, state, pincode, label } =
        shippingAddress;
      const normalizedPhone = cleanPhone(phone);
      const normalizedPincode = (pincode || "").toString().trim();

      if (!fullName || !fullName.trim()) {
        return res.status(400).json({ status: "error", message: "Recipient full name is required." });
      }
      if (!normalizedPhone || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
        return res.status(400).json({
          status: "error",
          message: "A valid 10-digit Indian mobile number is required.",
        });
      }
      if (!building || !building.trim()) {
        return res.status(400).json({ status: "error", message: "Building details are required." });
      }
      if (!street || !street.trim()) {
        return res.status(400).json({ status: "error", message: "Street details are required." });
      }
      if (!city || !city.trim()) {
        return res.status(400).json({ status: "error", message: "City is required." });
      }
      if (!state || !state.trim()) {
        return res.status(400).json({ status: "error", message: "State is required." });
      }
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

      if (saveAddress) {
        try {
          const count = await Address.countDocuments({ user: req.user._id });
          await Address.create({
            user: req.user._id,
            ...addressSnapshot,
            isDefault: count === 0,
          });
        } catch (e) {
          console.warn("[orderController] Could not auto-save address to book:", e.message);
        }
      }
    } else {
      return res.status(400).json({
        status: "error",
        message: "Shipping address is required (either addressId or shippingAddress object).",
      });
    }

    // Atomic reservation of the listing
    reservedListing = await Listing.findOneAndUpdate(
      { _id: listingId, status: "active" },
      { $set: { status: "sold" } },
      { new: true }
    );

    if (!reservedListing) {
      return res.status(409).json({
        status: "error",
        message: "This listing was just purchased or is no longer available.",
      });
    }

    // Server-side financial calculations
    const itemPrice = Number(reservedListing.price);
    const deliveryFee = 0; // Transparent zero-fee policy for circular reuse marketplace
    const totalPrice = itemPrice + deliveryFee;
    const orderReference = generateOrderReference();

    const order = await Order.create({
      orderReference,
      listing: reservedListing._id,
      buyer: req.user._id,
      seller: reservedListing.seller,
      itemPrice,
      deliveryFee,
      totalPrice,
      currency: reservedListing.currency || "INR",
      shippingAddress: addressSnapshot,
      paymentMethod: "PAY_ON_DELIVERY",
      status: "confirmed",
      statusHistory: [
        {
          status: "confirmed",
          changedAt: new Date(),
          changedBy: req.user._id,
          note: "Order created and listing reserved.",
        },
      ],
    });

    await logEvent(req.user, "order.created", {
      targetType: "Order",
      targetId: order._id,
      metadata: {
        orderReference,
        listingId: reservedListing._id,
        seller: reservedListing.seller,
        totalPrice,
      },
    });

    res.status(201).json({
      status: "ok",
      order,
      message: "Order placed successfully. The seller has been notified for fulfillment.",
    });
  } catch (err) {
    // If order persistence failed after reserving listing, release listing back to active
    if (reservedListing) {
      await Listing.findByIdAndUpdate(reservedListing._id, { $set: { status: "active" } }).catch(
        (revertErr) => console.error("[orderController] Rollback failed:", revertErr.message)
      );
    }
    next(err);
  }
}

// GET /api/orders/mine
async function listMyOrders(req, res, next) {
  try {
    const { role } = req.query; // 'buyer', 'seller', or omit for both

    let purchases = [];
    let sales = [];

    if (!role || role === "buyer") {
      purchases = await Order.find({ buyer: req.user._id })
        .populate({
          path: "listing",
          populate: { path: "component", select: "type brand model capacity workingStatus" },
        })
        .populate({ path: "seller", select: "name email" })
        .sort({ createdAt: -1 });
    }

    if (!role || role === "seller") {
      sales = await Order.find({ seller: req.user._id })
        .populate({
          path: "listing",
          populate: { path: "component", select: "type brand model capacity workingStatus" },
        })
        .populate({ path: "buyer", select: "name email" })
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      status: "ok",
      purchasesCount: purchases.length,
      salesCount: sales.length,
      purchases,
      sales,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid order ID." });
    }

    const order = await Order.findById(id)
      .populate({
        path: "listing",
        populate: { path: "component", select: "type brand model capacity condition workingStatus health" },
      })
      .populate({ path: "buyer", select: "name email" })
      .populate({ path: "seller", select: "name email" });

    if (!order) {
      return res.status(404).json({ status: "error", message: "Order not found." });
    }

    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to view this order.",
      });
    }

    res.status(200).json({ status: "ok", order });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/orders/:id/status
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid order ID." });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ status: "error", message: "Order not found." });
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this order.",
      });
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (order.status === status) {
      return res.status(400).json({
        status: "error",
        message: `Order is already in ${status} status.`,
      });
    }

    // State transition rules
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        status: "error",
        message: `Cannot transition order from final status '${order.status}'.`,
      });
    }

    if (isBuyer && !isAdmin) {
      if (status !== "cancelled") {
        return res.status(403).json({
          status: "error",
          message: "Buyers can only request cancellation of their orders.",
        });
      }
      if (order.status === "shipped") {
        return res.status(400).json({
          status: "error",
          message: "Order has already been shipped and cannot be cancelled directly.",
        });
      }
    }

    if (isSeller && !isAdmin) {
      const allowedFromConfirmed = ["shipped", "cancelled"];
      const allowedFromShipped = ["delivered"];

      if (order.status === "confirmed" && !allowedFromConfirmed.includes(status)) {
        return res.status(400).json({
          status: "error",
          message: `Sellers can only change 'confirmed' orders to 'shipped' or 'cancelled'.`,
        });
      }
      if (order.status === "shipped" && !allowedFromShipped.includes(status)) {
        return res.status(400).json({
          status: "error",
          message: `Sellers can only change 'shipped' orders to 'delivered'.`,
        });
      }
    }

    // Apply status change
    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: (note || "").trim(),
    });

    // If cancelled, release listing back to active
    if (status === "cancelled") {
      await Listing.findByIdAndUpdate(order.listing, { $set: { status: "active" } }).catch((e) =>
        console.error("[orderController] Listing release failed on cancel:", e.message)
      );
    }

    await order.save();

    await logEvent(req.user, "order.status_updated", {
      targetType: "Order",
      targetId: order._id,
      metadata: { newStatus: status, note },
    });

    res.status(200).json({ status: "ok", order });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  listMyOrders,
  getOrder,
  updateOrderStatus,
  generateOrderReference,
};
