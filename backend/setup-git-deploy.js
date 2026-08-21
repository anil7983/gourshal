const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'Gourshal@2000'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('✅ SSH connected to 200.234.39.211 as root.');
  
  const setupScript = `
set -e

echo "=== Step 1: Cloning repository to ~/gourshal-repo ==="
cd ~
if [ -d "gourshal-repo" ]; then
  echo "gourshal-repo already exists, updating repo..."
  cd gourshal-repo
  git pull origin main
  cd ~
else
  git clone https://github.com/anil7983/gourshal.git gourshal-repo
fi

echo ""
echo "=== Step 2: Creating ~/deploy-backend.sh script ==="
cat > ~/deploy-backend.sh << 'EOF'
#!/bin/bash
set -e
cd ~/gourshal-repo
git pull origin main
rsync -a --exclude='.env' --exclude='node_modules' backend/ /var/www/gourshal/
cd /var/www/gourshal
npm install --production
pm2 restart gourshal
echo "Deploy done!"
EOF
chmod +x ~/deploy-backend.sh

echo ""
echo "=== Step 3: Running ~/deploy-backend.sh ==="
~/deploy-backend.sh

echo ""
echo "=== Step 4: Verification ==="
echo "--- Checking scriptSrcAttr in /var/www/gourshal/server.js ---"
grep -n "scriptSrcAttr" /var/www/gourshal/server.js || echo "NOT FOUND"
echo ""
echo "--- PM2 Status ---"
pm2 status
  `;

  conn.exec(setupScript, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log('\n✅ Remote script finished with exit code:', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).on('error', (err) => {
  console.error('❌ SSH Connection Error:', err.message || err);
}).connect(config);
