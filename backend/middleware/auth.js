const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ ok: false, error: 'Invalid token structure.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Invalid token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: 'Authentication required.' });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ ok: false, error: 'Access denied. Admin only.' });
  }
  next();
};

const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Invalid token, continue as guest
    }
  }
  next();
};

module.exports = { authenticate, requireAdmin, optionalAuth };
