const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || '',
  readyTimeout: 30000
};

const zipPath = path.resolve(__dirname, '..', 'gourshal-hostinger-deploy.zip');

console.log('🚀 Starting Hostinger VPS Automated Deployment...');
console.log(`Connecting to ${config.host} as ${config.username}...`);

const conn = new Client();

function executeCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔹 Executing script on VPS...`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      let errorOutput = '';

      stream.on('close', (code, signal) => {
        if (code !== 0) {
          console.warn(`⚠️ Remote script finished with code ${code}`);
        }
        resolve({ code, output, errorOutput });
      }).on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
      }).stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        process.stderr.write(text);
      });
    });
  });
}

function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Uploading ${localPath} to ${remotePath}...`);
    conn.sftp((err, sftp) => {
      if (err) return reject(err);

      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);

      let totalSize = fs.statSync(localPath).size;
      let uploaded = 0;
      let lastPercent = 0;

      readStream.on('data', chunk => {
        uploaded += chunk.length;
        const percent = Math.floor((uploaded / totalSize) * 100);
        if (percent >= lastPercent + 10 || percent === 100) {
          lastPercent = percent;
          process.stdout.write(`\rUploading: ${percent}% (${(uploaded / (1024 * 1024)).toFixed(1)} MB / ${(totalSize / (1024 * 1024)).toFixed(1)} MB)`);
        }
      });

      writeStream.on('close', () => {
        console.log('\n✅ File upload complete!');
        resolve();
      });

      writeStream.on('error', (e) => reject(e));
      readStream.pipe(writeStream);
    });
  });
}

conn.on('ready', async () => {
  console.log('✅ SSH Connection Established!');

  try {
    // 1. Upload the zip package
    await uploadFile(conn, zipPath, '/root/gourshal.zip');

    // 2. Prepare system and software
    const setupScript = `
set -e
export DEBIAN_FRONTEND=noninteractive

echo "==> [1/6] Updating packages & installing prerequisites..."
apt-get update -y
apt-get install -y unzip curl nginx

echo "==> [2/6] Checking Node.js..."
if ! command -v node &> /dev/null || [ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 18 ]; then
  echo "Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "==> [3/6] Installing PM2..."
npm install -g pm2 || true

echo "==> [4/6] Deploying application files..."
mkdir -p /var/www/gourshal
unzip -o /root/gourshal.zip -d /var/www/gourshal

cd /var/www/gourshal
echo "Installing Node modules..."
npm install --production

echo "Seeding database..."
node seed.js || true

echo "==> [5/6] Managing PM2 process..."
pm2 stop gourshal || true
pm2 delete gourshal || true
pm2 start server.js --name "gourshal" --time
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "==> [6/6] Configuring Nginx reverse proxy..."
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

ln -sf /etc/nginx/sites-available/gourshal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "==> Checking application status..."
sleep 3
curl -s http://127.0.0.1:5000/api/health || true
echo ""
curl -s http://127.0.0.1/api/health || true
echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
`;

    await executeCommand(conn, setupScript);

    console.log('\n🎉 ALL DONE! App is live on the server.');
    conn.end();
  } catch (err) {
    console.error('❌ Error during deployment:', err);
    conn.end();
  }
}).on('error', (err) => {
  console.error('❌ SSH Connection Error:', err);
}).connect(config);
