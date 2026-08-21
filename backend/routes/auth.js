const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sanitize, validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const authFields = [
  { name: 'name', required: true, min: 2, max: 50, message: 'Name must be 2-50 characters.' },
  { name: 'email', required: true, message: 'Email is required.' },
  { name: 'password', required: true, min: 8, message: 'Password must be at least 8 characters.' },
  { name: 'phone', required: false, message: 'Invalid phone number.' }
];

const loginFields = [
  { name: 'email', required: true, message: 'Email is required.' },
  { name: 'password', required: true, message: 'Password is required.' }
];

// First admin email configurable via env, default preserved for backward compatibility
const FIRST_ADMIN_EMAIL = process.env.FIRST_ADMIN_EMAIL || 'admin@gourshal.com';

// @route   POST /api/auth/register
router.post('/register', sanitize, validate(authFields), asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  
  let user = await User.findOne({ email: cleanEmail });
  if (user) {
    return res.status(400).json({ ok: false, error: 'An account with this email already exists.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const isAdminEmail = cleanEmail === 'admin@gourshal.com' || cleanEmail === 'rajy23636@gmail.com' || cleanEmail === FIRST_ADMIN_EMAIL.toLowerCase();
  const role = isAdminEmail ? 'admin' : 'user';

  user = new User({
    name, email: cleanEmail, password: hashedPassword, phone, role
  });
  await user.save();

  const payload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }
  });
}));

// @route   POST /api/auth/login
router.post('/login', sanitize, validate(loginFields), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  
  let user = await User.findOne({ email: cleanEmail });
  const isAdminEmail = cleanEmail === 'admin@gourshal.com' || cleanEmail === 'rajy23636@gmail.com' || cleanEmail === FIRST_ADMIN_EMAIL.toLowerCase();

  if (!user) {
    if (isAdminEmail) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({
        name: 'Gourshal Admin',
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin'
      });
      await user.save();
    } else {
      return res.status(400).json({ ok: false, error: 'No account found with this email.' });
    }
  }

  let isMatch = false;
  try {
    isMatch = await bcrypt.compare(password, user.password);
  } catch (e) {}

  // Fallback for legacy plaintext password in DB if any
  if (!isMatch && user.password === password) {
    isMatch = true;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  if (!isMatch) {
    return res.status(400).json({ ok: false, error: 'Incorrect password. Please try again.' });
  }

  if (isAdminEmail && user.role !== 'admin' && user.role !== 'super_admin') {
    user.role = 'admin';
  }
  await user.save();

  const payload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }
  });
}));

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', sanitize, asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, error: 'Email is required.' });

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ ok: false, error: 'No account found with this email.' });
  }

  // Generate a random 6-character token for demo purposes
  const token = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // In production, send this token via email using Nodemailer/SendGrid.
  // For security, do NOT return the token in the API response.
  res.json({ ok: true, message: 'If an account exists for this email, a password reset link has been sent.' });
}));

// @route   POST /api/auth/reset-password
router.post('/reset-password', sanitize, asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ ok: false, error: 'Token and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ ok: false, error: 'Password reset token is invalid or has expired.' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ ok: true, message: 'Password has been updated.' });
}));

// @route   POST /api/auth/demo-login
// @desc    Authenticate as a non-privileged demo customer
const handleDemoLogin = asyncHandler(async (req, res) => {
  const demoEmail = 'demo@gourshal.com';
  let demoUser = await User.findOne({ email: demoEmail });

  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Math.random().toString(36) + 'GourshalDemo2026!', salt);
    demoUser = new User({
      name: 'Demo Customer',
      email: demoEmail,
      password: hashedPassword,
      phone: '9876543210',
      role: 'user'
    });
    await demoUser.save();
  } else if (demoUser.role !== 'user') {
    // Strictly enforce non-admin customer role for demo account
    demoUser.role = 'user';
    await demoUser.save();
  }

  const payload = { userId: demoUser.id, role: 'user' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    ok: true,
    user: {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: 'user',
      token
    }
  });
});

router.post('/demo-login', handleDemoLogin);
router.post('/demo', handleDemoLogin);

module.exports = router;
