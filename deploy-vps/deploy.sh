#!/bin/bash
set -e

echo "=========================================="
echo "  GOURSHAL VPS Deployment Script"
echo "=========================================="
echo ""

# Configuration
APP_NAME="gourshal-api"
APP_DIR="/var/www/gourshal-backend"
NGINX_CONF="/etc/nginx/sites-available/gourshal.com"
SYSTEMD_CONF="/etc/systemd/system/gourshal-api.service"
DOMAIN="gourshal.com"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./deploy.sh)"
    exit 1
fi

echo "[1/7] Updating system packages..."
apt update && apt upgrade -y

echo ""
echo "[2/7] Installing dependencies..."
apt install -y nginx nodejs npm certbot python3-certbot-nginx ufw

echo ""
echo "[3/7] Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "[4/7] Creating application directory..."
mkdir -p $APP_DIR
mkdir -p /var/www/gourshal-backend

echo ""
echo "[5/7] Copying application files..."
# This should be run from the project root
cp -r backend/* $APP_DIR/
cp -r backend/.* $APP_DIR/ 2>/dev/null || true

echo ""
echo "[6/7] Installing Node.js dependencies..."
cd $APP_DIR
npm install --production

echo ""
echo "[7/7] Setting up systemd service..."
cp deploy-vps/systemd/gourshal-api.service $SYSTEMD_CONF
systemctl daemon-reload
systemctl enable $APP_NAME
systemctl start $APP_NAME

echo ""
echo "[8/9] Setting up nginx..."
cp deploy-vps/nginx/gourshal.com.conf $NGINX_CONF
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "[9/9] Setting up SSL with Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --redirect

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Set environment variables in $APP_DIR/.env"
echo "2. Check service status: systemctl status $APP_NAME"
echo "3. View logs: journalctl -u $APP_NAME -f"
echo "4. Test API: curl https://$DOMAIN/api/health"
echo ""
echo "To update the app in the future, run:"
echo "  sudo ./deploy.sh"
