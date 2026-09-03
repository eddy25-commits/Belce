const express = require("express");
const asyncHandler = require("express-async-handler");
const zones = require("../models/deliveryZoneStore");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/delivery-zones
// @desc    Get active delivery zones for the checkout dropdown (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await zones.getActiveZones());
  })
);

// @route   GET /api/delivery-zones/admin/all
// @desc    Get ALL delivery zones including inactive ones (admin only)
router.get(
  "/admin/all",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json(await zones.getAllZones());
  })
);

// @route   POST /api/delivery-zones
// @desc    Create a delivery zone (admin only)
router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, scope, fee, isActive, sortOrder } = req.body;

    if (!name || !scope || fee === undefined || fee === null || fee === "") {
      res.status(400);
      throw new Error("Please provide a name, scope, and fee");
    }
    if (!zones.SCOPES.includes(scope)) {
      res.status(400);
      throw new Error("Scope must be either 'ghana' or 'international'");
    }

    const zone = await zones.createZone({
      name,
      scope,
      fee: Number(fee),
      isActive: isActive === undefined ? true : isActive === "true" || isActive === true,
      sortOrder: Number(sortOrder) || 0,
    });

    res.status(201).json(zone);
  })
);

// @route   PUT /api/delivery-zones/:id
// @desc    Update a delivery zone (admin only)
router.put(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await zones.getZoneById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error("Delivery zone not found");
    }

    const { name, scope, fee, isActive, sortOrder } = req.body;
    if (scope !== undefined && !zones.SCOPES.includes(scope)) {
      res.status(400);
      throw new Error("Scope must be either 'ghana' or 'international'");
    }

    const updated = await zones.updateZone(req.params.id, {
      name,
      scope,
      fee: fee !== undefined ? Number(fee) : undefined,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : undefined,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) || 0 : undefined,
    });

    res.json(updated);
  })
);

// @route   DELETE /api/delivery-zones/:id
// @desc    Delete a delivery zone (admin only)
router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await zones.getZoneById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error("Delivery zone not found");
    }
    await zones.deleteZone(req.params.id);
    res.json({ message: "Delivery zone removed" });
  })
);

module.exports = router;
