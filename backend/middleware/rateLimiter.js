const rateLimits = new Map();

const createRateLimiter = (windowMs, max) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!rateLimits.has(key)) {
      rateLimits.set(key, []);
    }
    
    const requests = rateLimits.get(key).filter(time => now - time < windowMs);
    
    if (requests.length >= max) {
      return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
    }
    
    requests.push(now);
    rateLimits.set(key, requests);
    next();
  };
};

module.exports = { createRateLimiter };
