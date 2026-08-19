# GOUSHAL VPS Deployment Guide
## Hostinger Ubuntu VPS + gourshal.com

### Prerequisites
- Hostinger Ubuntu VPS (20.04/22.04/24.04)
- Domain `gourshal.com` pointing to VPS IP
- SSH access to VPS

---

### Step 1: Upload Project to VPS

On your local machine, create a zip of the backend folder (excluding node_modules):

```bash
cd /path/to/gourshal
zip -r gourshal-backend.zip backend -x "backend/node_modules/*" "backend/.git/*"
```

Upload `gourshal-backend.zip` to VPS:
```bash
scp gourshal-backend.zip root@your-vps-ip:/root/
```

SSH into VPS:
```bash
ssh root@your-vps-ip
```

Extract and setup:
```bash
mkdir -p /var/www/gourshal-backend
cd /var/www/gourshal-backend
unzip /root/gourshal-backend.zip -d .
cd backend
npm install --production
```

---

### Step 2: Configure Environment Variables

Edit `.env` file on VPS:
```bash
nano /var/www/gourshal-backend/.env
```

Set these values:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
FIRST_ADMIN_EMAIL=rajy23636@gmail.com
ALLOWED_ORIGINS=https://gourshal.com,https://www.gourshal.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

### Step 3: Install and Configure Nginx

```bash
# Install nginx
apt update
apt install -y nginx

# Copy nginx config
cp deploy-vps/nginx/gourshal.com.conf /etc/nginx/sites-available/gourshal.com
ln -sf /etc/nginx/sites-available/gourshal.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
```

---

### Step 4: Setup Systemd Service

```bash
# Copy systemd service file
cp deploy-vps/systemd/gourshal-api.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable and start service
systemctl enable gourshal-api
systemctl start gourshal-api

# Check status
systemctl status gourshal-api
```

---

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d gourshal.com -d www.gourshal.com

# Test auto-renewal
certbot renew --dry-run
```

---

### Step 6: Configure Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

### Step 7: Verify Deployment

```bash
# Check API health
curl https://gourshal.com/api/health

# Expected response: {"ok":true,"message":"Gourshal API is running"}

# Check service logs
journalctl -u gourshal-api -f

# Check nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

### Step 8: MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Add your VPS IP address (or `0.0.0.0/0` for testing only)
4. Save

---

### Maintenance Commands

```bash
# Restart backend
systemctl restart gourshal-api

# View logs
journalctl -u gourshal-api -f

# Update code
cd /var/www/gourshal-backend
git pull  # or upload new files
npm install --production
systemctl restart gourshal-api

# Renew SSL
certbot renew
```
