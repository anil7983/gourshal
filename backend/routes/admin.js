const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sanitize, validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   GET /api/admin/orders
router.get('/orders', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { status, today } = req.query;
  let query = {};
  if (status && ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    query.status = status;
  }
  if (today === 'true') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    query.createdAt = { $gte: start };
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });
  const formattedOrders = orders.map(o => ({
    id: o.orderId,
    items: o.items,
    address: o.address,
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    placedAt: o.createdAt,
    expectedDelivery: o.expectedDelivery
  }));
  res.json({ ok: true, orders: formattedOrders });
}));

// @route   PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', authenticate, requireAdmin, sanitize, validate([{ name: 'status', required: true, message: 'Status is required.' }]), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid status.' });
  }
  
  const order = await Order.findOneAndUpdate(
    { orderId: req.params.id },
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ ok: false, error: 'Order not found' });
  res.json({ ok: true });
}));

// @route   GET /api/admin/users
router.get('/users', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  const usersWithCounts = await Promise.all(users.map(async (u) => {
    const count = await Order.countDocuments({
      $or: [
        { userId: u._id },
        { 'address.email': u.email }
      ]
    });
    return {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: count
    };
  }));
  res.json({ ok: true, users: usersWithCounts });
}));

// @route   GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments({});
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
  
  const revenueResult = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const revenue = revenueResult[0]?.total || 0;
  
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
  const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
  
  const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(10);
  const formattedRecent = recentOrders.map(o => ({
    id: o.orderId,
    items: o.items,
    address: o.address,
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    placedAt: o.createdAt,
    expectedDelivery: o.expectedDelivery
  }));
  
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 }).limit(10);
  
  res.json({
    ok: true,
    stats: {
      totalOrders,
      todayOrders,
      revenue,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    },
    recentOrders: formattedRecent,
    lowStock: lowStockProducts
  });
}));

// @route   GET /api/admin/low-stock
router.get('/low-stock', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const products = await Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 });
  res.json({ ok: true, products });
}));

// @route   GET /api/admin/payment-details
router.get('/payment-details', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, paymentDetails: user.paymentDetails || {} });
}));

// @route   PUT /api/admin/payment-details
router.put('/payment-details', authenticate, requireAdmin, sanitize, asyncHandler(async (req, res) => {
  const { bankAccount, ifscCode, accountHolderName, razorpayAccountId } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  
  user.paymentDetails = {
    bankAccount: bankAccount || user.paymentDetails?.bankAccount,
    ifscCode: ifscCode || user.paymentDetails?.ifscCode,
    accountHolderName: accountHolderName || user.paymentDetails?.accountHolderName,
    razorpayAccountId: razorpayAccountId || user.paymentDetails?.razorpayAccountId
  };

  await user.save();
  res.json({ ok: true, paymentDetails: user.paymentDetails });
}));

module.exports = router;
