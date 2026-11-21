// backend/src/routes/orders.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");
const {
  createOrder,
  listMyOrders,
  getOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

router.use(requireDb, protect);

router.get("/mine", listMyOrders);
router.post("/", createOrder);
router.get("/:id", getOrder);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
