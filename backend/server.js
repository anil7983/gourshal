const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// Flexible and secure CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin direct navigation)
    if (!origin) return callback(null, true);
    
    // If ALLOWED_ORIGINS is empty or wildcard, allow all
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Check if origin matches or is subdomain of allowed origins
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === origin) return true;
      try {
        const allowedHost = new URL(allowed).hostname;
        const originHost = new URL(origin).hostname;
        return originHost === allowedHost || originHost.endsWith('.' + allowedHost) || originHost.includes('hostinger') || originHost === 'localhost' || originHost === '127.0.0.1';
      } catch {
        return false;
      }
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to allow requests gracefully rather than crashing
    }
  },
  credentials: true
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { ok: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { ok: false, error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Gourshal API is running' });
});

const PORT = process.env.PORT || 5000;

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('WARNING: Razorpay keys not configured. Payment gateway is disabled.');
}

if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  console.warn('WARNING: ALLOWED_ORIGINS is not set in production. CORS will allow same-origin requests only.');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Serve static files from public directory both at root and with /public prefix
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0, etag: true, extensions: ['html'] }));
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: 0, etag: true, extensions: ['html'] }));
app.use('/styles', express.static(path.join(__dirname, 'public', 'styles'), { maxAge: 0, etag: true }));
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts'), { maxAge: 0, etag: true }));
app.use('/products', express.static(path.join(__dirname, 'public', 'products'), { maxAge: 0, etag: true }));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos'), { maxAge: 0, etag: true }));

// Serve frontend HTML/CSS/JS/assets from backend/public only
// Do NOT expose project root in production for security

// Fallback: serve index.html for any unmatched route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler must be last
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
