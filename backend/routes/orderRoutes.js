const express = require("express");
const asyncHandler = require("express-async-handler");
const orders = require("../models/orderStore");
const { requireAdmin, requireAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (admin only) - supports ?status=
router.get(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json(await orders.findAll({ status: req.query.status }));
  })
);

// @route   GET /api/orders/mine
// @desc    Get the signed-in customer's own order history
router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await orders.findMineByUser(req.user.id));
  })
);

// @route   GET /api/orders/reference/:reference
// @desc    Customer-facing order lookup by Paystack reference (order confirmation page)
router.get(
  "/reference/:reference",
  asyncHandler(async (req, res) => {
    const order = await orders.findByReference(req.params.reference);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    res.json(order);
  })
);

// @route   GET /api/orders/track
// @desc    Customer-facing order tracking lookup by order number and contact info
router.get(
  "/track",
  asyncHandler(async (req, res) => {
    const { orderNumber, email, phone } = req.query;

    if (!orderNumber && (!email || !phone)) {
      res.status(400);
      throw new Error("Please provide an order number or both email and phone number.");
    }

    const order = await orders.findByTrackingDetails({ orderNumber, email, phone });
    if (!order) {
      res.status(404);
      throw new Error("No order found for the details you provided.");
    }
    res.json(order);
  })
);

// @route   PUT /api/orders/:id/status
// @desc    Update order fulfillment status (admin only)
router.put(
  "/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { orderStatus } = req.body;
    if (!orderStatus) {
      res.status(400);
      throw new Error("Please provide an orderStatus");
    }
    const updated = await orders.updateOrderStatus(req.params.id, orderStatus);
    res.json(updated);
  })
);

module.exports = router;
