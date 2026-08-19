# GOUSHAL — Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- MongoDB Atlas account (or self-hosted MongoDB)
- Node.js v18+ with npm/pnpm
- Razorpay account (live keys) for payments
- Domain name configured with SSL

---

## 1. MongoDB Atlas Setup

### Free Tier Setup (Recommended for Launch)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create an account and click **Build your first cluster**
3. Choose **M0 Sandbox** (Free tier, 512MB storage)
4. Select your preferred region (India if targeting IN customers)
5. Click **Create Cluster**

### Database Configuration
6. In **Database Access**, create a new database user:
   - Username: `gourshal-admin`
   - Password: Generate a strong password (save it securely)
   - Privileges: Read and write to any database

7. In **Network Access**, whitelist IPs:
   - For production: Add your hosting provider IP or `0.0.0.0/0` (less secure)
   - For development: Add your local IP

8. In **Clusters > Connect**, copy the connection string:
   ```
   mongodb+srv://gourshal-admin:<password>@cluster0.xxxxx.mongodb.net/gourshal
   ```

---

## 2. Environment Variables Setup

Create a `.env` file in the `backend` directory. Copy from `.env.example` and fill in real values.

### Required Variables
```env
PORT=5000
MONGO_URI=mongodb+srv://gourshal-admin:<password>@cluster0.xxxxx.mongodb.net/gourshal
JWT_SECRET=<32+ character random string>
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
CORS_ORIGIN=https://gourshal.com
NODE_ENV=production
ADMIN_EMAIL=admin@gourshal.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generating JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Backend Deployment Options

### Option A: Render (Recommended — easiest)
1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create account
3. Click **New > Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `gourshal-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables in the Render dashboard
7. Add MongoDB Atlas connection string in `MONGO_URI`

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create project from GitHub repo
3. Select `backend` folder as root
4. Add environment variables
5. Railway auto-deploys on push

### Option C: Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the `backend` directory
3. Set environment variables: `vercel env add`
4. For production: `vercel --prod`

### Option D: DigitalOcean App Platform
1. Create new app from GitHub
2. Select backend folder
3. Auto-deploys with environment variables

### Option E: Heroku
```bash
# Install Heroku CLI
heroku login
heroku create gourshal-api
heroku config:set MONGO_URI=... JWT_SECRET=...
git subtree push --prefix backend heroku main
```

---

## 4. Frontend Deployment Options

### Option A: Netlify (Static Hosting)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build first
cd backend && npm run build

# Deploy
netlify deploy --prod --dir=backend/public
```

### Option B: Vercel
1. Create `vercel.json` in project root:
```json
{
  "version": 2,
  "routes": [
    { "src": "/api/(.*)", "dest": "https://your-api-url.onrender.com/api/$1" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

### Option C: Cloudflare Pages
1. Connect GitHub repo
2. Build command (if using build script): `npm run build`
3. Publish directory: `public` or `backend/public`

### Option D: S3 + CloudFront (AWS)
```bash
aws s3 sync public/ s3://gourshal.com --delete
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

---

## 5. SSL Configuration

### Using Let's Encrypt (Self-hosted / VPS)
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot --nginx -d gourshal.com -d www.gourshal.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Cloudflare (Free SSL)
1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Change nameservers to Cloudflare
4. Enable **Full (strict)** SSL mode
5. Enable Always Use HTTPS

### Using Hosting Provider SSL
Most platforms (Render, Railway, Vercel, Netlify) provide free SSL certificates automatically via Let's Encrypt. No manual configuration needed.

---

## 6. Production Build Steps

### Full Production Build
```bash
# 1. Install dependencies
cd backend
npm install --production

# 2. Build frontend assets
npm run build

# 3. Seed database (first time only)
npm run seed

# 4. Start server
npm start
```

### Environment-specific builds
```bash
# Development
NODE_ENV=development npm run dev

# Staging
NODE_ENV=staging node server.js

# Production
NODE_ENV=production node server.js
```

---

## 7. Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

The included `docker-compose.yml` manages both backend and MongoDB.

---

## 8. Post-Deployment Checklist

### Security
- [ ] Change all default secrets (JWT_SECRET, admin password)
- [ ] Verify CORS_ORIGIN points only to your production domain
- [ ] Enable HTTPS everywhere (redirect HTTP → HTTPS)
- [ ] Set `NODE_ENV=production`
- [ ] Review MongoDB Atlas IP whitelist
- [ ] Enable Razorpay live mode with live keys
- [ ] Set rate limiting values appropriately

### Functionality
- [ ] Test registration and login flow
- [ ] Test product listing and filtering
- [ ] Test cart add/remove
- [ ] Test checkout with Razorpay test mode first
- [ ] Test order placement and tracking
- [ ] Test admin dashboard access
- [ ] Verify seed data loaded correctly

### Performance
- [ ] Enable gzip/brotli compression on hosting provider
- [ ] Configure CDN for static assets (CSS, JS, images)
- [ ] Set cache headers: `Cache-Control: public, max-age=31536000` for assets
- [ ] Enable MongoDB connection pooling (default in Mongoose)
- [ ] Run a Lighthouse audit (target: 90+ performance score)

### SEO & Analytics
- [ ] Submit sitemap.xml to Google Search Console
- [ ] Add Google Analytics tracking ID
- [ ] Verify Open Graph tags with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Set up Bing Webmaster Tools

### Monitoring & Alerts
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, or Render's built-in)
- [ ] Configure error tracking (Sentry, or hosting provider)
- [ ] Set up log aggregation (if needed)
- [ ] Create database backup schedule in MongoDB Atlas
- [ ] Monitor API rate limits on Razorpay

### Legal & Compliance
- [ ] Add real Privacy Policy URL
- [ ] Add real Terms of Service URL
- [ ] Configure real business email addresses
- [ ] Add GST/Business registration number if applicable
- [ ] Ensure payment processing complies with local laws (India: PCI DSS via Razorpay)

---

## 9. Quick Deploy Commands

```bash
# Install dependencies
cd backend && npm install

# Seed database with default products
npm run seed

# Build frontend assets
npm run build

# Start production server
NODE_ENV=production node server.js
```

---

## 10. Troubleshooting

### MongoDB Connection Fails
- Verify MONGO_URI is correct
- Check Atlas IP whitelist allows your server
- Ensure database user has correct permissions

### Frontend API Calls Fail
- Update CORS_ORIGIN to production domain
- Update API_URL in scripts/auth.js if backend URL changed
- Check that backend server is running

### Payment Not Working
- Verify Razorpay keys are live keys (not test)
- Ensure payment webhook URL is configured in Razorpay dashboard
- Test with Razorpay test mode first

### Build Fails
- Ensure Node.js version matches (recommend v18 LTS)
- Delete node_modules and reinstall
- Check for syntax errors in scripts
