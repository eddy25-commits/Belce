const express = require("express");
const asyncHandler = require("express-async-handler");
const products = require("../models/productStore");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadImages, deleteImages } = require("../utils/imageStorage");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all active products (public) - supports ?category=&search=&featured=true
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, search, featured } = req.query;
    res.json(await products.getActiveProducts({ category, search, featured }));
  })
);

// @route   GET /api/products/admin/all
// @desc    Get ALL products including inactive ones (admin only)
router.get(
  "/admin/all",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json(await products.getAllProducts());
  })
);

// @route   GET /api/products/:id
// @desc    Get single product
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await products.getProductById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json(product);
  })
);

// @route   POST /api/products
// @desc    Create a product (admin only), up to 5 images
router.post(
  "/",
  requireAdmin,
  upload.array("images", 5),
  asyncHandler(async (req, res) => {
    const { name, description, price, category, brand, stock, isFeatured } = req.body;

    if (!name || !description || !price || !category) {
      res.status(400);
      throw new Error("Please provide name, description, price, and category");
    }

    const images = await uploadImages(req.files);

    const product = await products.createProduct({
      name,
      description,
      price: Number(price),
      category,
      brand,
      stock: Number(stock) || 0,
      isFeatured: isFeatured === "true" || isFeatured === true,
      images,
    });

    res.status(201).json(product);
  })
);

// @route   PUT /api/products/:id
// @desc    Update a product (admin only), optionally add/remove images
router.put(
  "/:id",
  requireAdmin,
  upload.array("images", 5),
  asyncHandler(async (req, res) => {
    const existing = await products.getProductById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error("Product not found");
    }

    const { name, description, price, category, brand, stock, isFeatured, isActive, removeImagePaths } =
      req.body;

    // Remove selected images from storage + the images array (removeImagePaths
    // holds the storage `path` of each image to remove, sent by the admin UI)
    let currentImages = existing.images || [];
    if (removeImagePaths) {
      const pathsToRemove = Array.isArray(removeImagePaths) ? removeImagePaths : [removeImagePaths];
      await deleteImages(pathsToRemove);
      currentImages = currentImages.filter((img) => !pathsToRemove.includes(img.path));
    }

    if (req.files && req.files.length > 0) {
      const newImages = await uploadImages(req.files);
      currentImages = [...currentImages, ...newImages];
    }

    const updated = await products.updateProduct(req.params.id, {
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      category,
      brand,
      stock: stock !== undefined ? Number(stock) : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === "true" || isFeatured === true : undefined,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : undefined,
      images: currentImages,
    });

    res.json(updated);
  })
);

// @route   DELETE /api/products/:id
// @desc    Delete a product (admin only)
router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await products.getProductById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error("Product not found");
    }

    await deleteImages((existing.images || []).map((img) => img.path));
    await products.deleteProduct(req.params.id);
    res.json({ message: "Product removed" });
  })
);

module.exports = router;
