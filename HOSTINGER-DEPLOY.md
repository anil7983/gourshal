# GOURSHAL — Hostinger Full Stack (Frontend + Backend) Deployment Guide

A complete, production-ready bundle **`gourshal-hostinger-deploy.zip`** has been generated in your project root containing both the backend API and the optimized frontend.

---

## 🚀 Option 1: Hostinger hPanel (Cloud / Business Web Hosting with Node.js)

### Step 1: Create Node.js Application in hPanel
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** → Select your domain (`gourshal.com`) → **Advanced** → **Node.js** (or search "Node.js" in the top bar).
3. Click **Create Application** (or **Add Application**):
   - **Node.js Version**: Select `18.x` or `20.x`
   - **Application Mode**: `Production`
   - **Application Root**: e.g., `nodejs` or `public_html` (or your domain root folder)
   - **Application Startup File**: `server.js`
4. Click **Create**.

### Step 2: Upload Files via File Manager
1. Open **File Manager** in hPanel and go to your Node.js application directory (e.g. `public_html` or `nodejs`).
2. Upload the file:
   - **`gourshal-hostinger-deploy.zip`** (located at the root of your project)
3. Right-click `gourshal-hostinger-deploy.zip` and choose **Extract** directly into that directory.
4. Verify the folder structure looks like this:
   ```
   ├── .env
   ├── server.js
   ├── package.json
   ├── package-lock.json
   ├── seed.js
   ├── middleware/
   ├── models/
   ├── routes/
   └── public/               (contains all HTML, CSS, JS, images, videos)
   ```

### Step 3: Environment Variables
Ensure `.env` exists in the folder or add these in the Hostinger Node.js panel:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-address>/gourshal?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FIRST_ADMIN_EMAIL=admin@gourshal.com
ALLOWED_ORIGINS=https://gourshal.com,https://www.gourshal.com
```

### Step 4: Install Dependencies & Run
1. In the Hostinger Node.js panel, click **Run NPM Install** (or open Terminal and run `npm install --production`).
2. Click **Start Application** / **Restart Application**.

---

## 🖥️ Option 2: Hostinger VPS (Ubuntu / Debian)

If you are using a Hostinger VPS:
1. Connect via SSH:
   ```bash
   ssh root@your_hostinger_vps_ip
   ```
2. Upload and extract `gourshal-hostinger-deploy.zip` to `/var/www/gourshal`:
   ```bash
   mkdir -p /var/www/gourshal
   unzip gourshal-hostinger-deploy.zip -d /var/www/gourshal
   cd /var/www/gourshal
   npm install --production
   ```
3. Start with PM2:
   ```bash
   pm2 start server.js --name gourshal
   pm2 save
   pm2 startup
   ```

---

## 🔍 Verification & Testing

Once running:
- **API Health Check**: `https://gourshal.com/api/health` → `{"ok":true,"message":"Gourshal API is running"}`
- **Products API**: `https://gourshal.com/api/products` → returns 16 products from MongoDB Atlas
- **Frontend Pages**:
  - `https://gourshal.com/` (Home page)
  - `https://gourshal.com/shop` (Shop with live DB products)
  - `https://gourshal.com/login` (Auth / Registration)
  - `https://gourshal.com/cart` (Cart & checkout)
  - `https://gourshal.com/admin` (Admin Dashboard)

---

## 🛠️ Quick Troubleshooting
- **MongoDB Connection**: Make sure MongoDB Atlas Network Access has `0.0.0.0/0` allowed so Hostinger's servers can connect.
- **Port**: Hostinger automatically maps the port; `server.js` uses `process.env.PORT || 5000`.

