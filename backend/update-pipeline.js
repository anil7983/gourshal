const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'Gourshal@2000'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected! Updating deploy script to include build step and deploying...');
  conn.exec(`
cat > ~/deploy-backend.sh << 'EOF'
#!/bin/bash
set -e
cd ~/gourshal-repo
git pull origin main
node scripts/build.js
rsync -a --exclude='.env' --exclude='node_modules' backend/ /var/www/gourshal/
cd /var/www/gourshal
npm install --production
pm2 restart gourshal
echo "Deploy done!"
EOF
chmod +x ~/deploy-backend.sh

~/deploy-backend.sh
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('\nDeploy with build completed with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
