const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || ''
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Fixing Nginx and reloading PM2...');
  conn.exec(`
    # 1. Restart PM2 with newest server.js
    cd /var/www/gourshal
    pm2 restart gourshal --update-env

    # 2. Configure Nginx
    cat << 'EOF' > /etc/nginx/sites-available/gourshal
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name gourshal.com www.gourshal.com 200.234.39.211 _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    rm -f /etc/nginx/sites-enabled/*
    ln -sf /etc/nginx/sites-available/gourshal /etc/nginx/sites-enabled/gourshal
    nginx -t
    systemctl restart nginx

    echo "--- Testing Nginx on port 80 ---"
    curl -i http://127.0.0.1/api/health
    echo ""
    echo "--- Testing Products API on port 80 ---"
    curl -s http://127.0.0.1/api/products | head -c 200
    echo ""
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Finished with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
