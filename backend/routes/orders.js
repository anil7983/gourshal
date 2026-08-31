const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { optionalAuth, authenticate } = require('../middleware/auth');
const { sanitize, validate, isValidEmail } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

let razorpayInstance = null;
const RazorpayEnabled = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
if (RazorpayEnabled) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('Razorpay keys not configured. Payment gateway is disabled.');
}

const orderFields = [
  { name: 'items', required: true, message: 'Items are required.' },
  { name: 'address', required: true, message: 'Address is required.' },
  { name: 'paymentMethod', required: true, message: 'Payment method is required.' },
  { name: 'subtotal', required: true, message: 'Subtotal is required.' },
  { name: 'shipping', required: true, message: 'Shipping is required.' },
  { name: 'total', required: true, message: 'Total is required.' }
];

// @route   GET /api/orders/payment-methods
router.get('/payment-methods', (req, res) => {
  res.json({
    ok: true,
    razorpayEnabled: !!razorpayInstance,
    razorpayKey: RazorpayEnabled ? process.env.RAZORPAY_KEY_ID : null
  });
});

// @route   POST /api/orders/create-payment
router.post('/create-payment', optionalAuth, sanitize, validate([{ name: 'amount', required: true, message: 'Amount is required.' }]), asyncHandler(async (req, res) => {
  if (!razorpayInstance) {
    return res.status(500).json({ ok: false, error: 'Online payment gateway is temporarily unavailable. Please select Cash on Delivery (COD) to place your order.' });
  }
  const { amount } = req.body;
  
  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: 'rcpt_' + Date.now()
  };

  const order = await razorpayInstance.orders.create(options);
  res.json({ ok: true, orderId: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY_ID });
}));

// @route   POST /api/orders
router.post('/', optionalAuth, sanitize, validate(orderFields), asyncHandler(async (req, res) => {
  const { items, address, paymentMethod, subtotal, shipping, discountAmt, total, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {
    if (!razorpayInstance) {
      return res.status(500).json({ ok: false, error: 'Online payment gateway is not configured on the server. Please select Cash on Delivery (COD).' });
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: 'Payment details missing. Payment was not verified.' });
    }

    const existingOrder = await Order.findOne({ 'paymentId': razorpay_order_id });
    if (existingOrder) {
      return res.json({ ok: true, orderId: existingOrder.orderId, message: 'Order already exists' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: 'Payment signature verification failed.' });
    }
  }

  // Validate products and check stock
  for (const item of items) {
    const isObjectId = mongoose.isValidObjectId(item.productId);
    const product = await Product.findOne(
      isObjectId ? { $or: [{ productId: item.productId }, { _id: item.productId }] } : { productId: item.productId }
    );
    if (!product) {
      return res.status(404).json({ ok: false, error: `Product "${item.name || item.productId}" not found.` });
    }
    if (product.stock < item.qty) {
      return res.status(400).json({ ok: false, error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
    }
  }

  // Determine user account to link order to
  let orderUserId = req.user ? req.user.userId : null;
  if (!orderUserId && address && address.email) {
    const cleanEmail = address.email.toLowerCase().trim();
    const matchedUser = await User.findOne({ email: cleanEmail });
    if (matchedUser) {
      orderUserId = matchedUser._id;
    }
  }

  const orderId = 'GOU' + Date.now().toString().slice(-8).toUpperCase();
  const expectedDelivery = new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  const isOnlinePayment = paymentMethod === 'razorpay' || paymentMethod === 'upi';

  const newOrder = new Order({
    orderId,
    userId: orderUserId,
    items,
    address: {
      ...address,
      email: address.email?.toLowerCase().trim()
    },
    paymentMethod,
    paymentId: razorpay_order_id || null,
    paymentStatus: isOnlinePayment ? 'completed' : 'pending',
    subtotal: Number(subtotal),
    shipping: Number(shipping),
    discountAmt: Number(discountAmt) || 0,
    total: Number(total),
    expectedDelivery,
    status: isOnlinePayment ? 'confirmed' : 'pending'
  });

  await newOrder.save();

  // Decrement stock for all ordered items
  for (const item of items) {
    const isObjectId = mongoose.isValidObjectId(item.productId);
    await Product.findOneAndUpdate(
      isObjectId ? { $or: [{ productId: item.productId }, { _id: item.productId }] } : { productId: item.productId },
      { $inc: { stock: -item.qty } }
    );
  }

  res.json({ ok: true, orderId: newOrder.orderId });
}));

// @route   GET /api/orders
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  const userEmail = user ? user.email : null;

  const orders = await Order.find({
    $or: [
      { userId: req.user.userId },
      userEmail ? { 'address.email': userEmail } : null
    ].filter(Boolean)
  }).sort({ createdAt: -1 });
  
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

module.exports = router;
