const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { sanitize, validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const productFields = [
  { name: 'name', required: true, min: 2, max: 100, message: 'Name must be 2-100 characters.' },
  { name: 'category', required: true, message: 'Category is required.' },
  { name: 'categorySlug', required: true, message: 'Category slug is required.' },
  { name: 'price', required: true, message: 'Price is required.' },
  { name: 'stock', required: true, message: 'Stock is required.' }
];

// @route   GET /api/products
// @desc    Get all products (or filter by admin if requested)
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.adminOnly === 'true' && req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    query.adminId = req.user.userId;
  }

  const products = await Product.find(query);
  const formatted = products.map(p => ({
    id: p.productId,
    productId: p.productId,
    adminId: p.adminId,
    name: p.name,
    category: p.category,
    categorySlug: p.categorySlug,
    price: p.price,
    originalPrice: p.originalPrice,
    unit: p.unit,
    badge: p.badge,
    rating: p.rating,
    reviews: p.reviews,
    stock: p.stock,
    description: p.description,
    longDescription: p.longDescription,
    benefits: p.benefits,
    ingredients: p.ingredients,
    glowColor: p.glowColor,
    image: p.image,
    svg: p.svg
  }));
  res.json({ ok: true, products: formatted });
}));

// @route   POST /api/products
// @desc    Create a product
router.post('/', requireAdmin, sanitize, validate(productFields), asyncHandler(async (req, res) => {
  const { name, category, categorySlug, price, stock, ...rest } = req.body;
  
  if (isNaN(price) || isNaN(stock) || Number(price) < 0 || Number(stock) < 0) {
    return res.status(400).json({ ok: false, error: 'Price and stock must be valid non-negative numbers.' });
  }

  const newProduct = new Product({
    ...rest,
    name,
    category,
    categorySlug,
    price: Number(price),
    stock: Number(stock),
    productId: 'PRD' + Date.now(),
    adminId: req.user.userId
  });
  await newProduct.save();
  res.json({ ok: true, product: newProduct });
}));

// @route   DELETE /api/products/:productId
// @desc    Delete a product
router.delete('/:productId', requireAdmin, asyncHandler(async (req, res) => {
  const query = { productId: req.params.productId };
  if (req.user.role !== 'super_admin') {
    query.adminId = req.user.userId;
  }
  const deleted = await Product.findOneAndDelete(query);
  if (!deleted) return res.status(404).json({ ok: false, error: 'Not found or not authorized' });
  res.json({ ok: true });
}));

module.exports = router;
