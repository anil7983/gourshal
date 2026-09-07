const { Client } = require('../backend/node_modules/ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'Gourshal@2000',
  readyTimeout: 30000
};

const conn = new Client();

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔹 Running: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      let errOut = '';
      stream.on('close', (code) => {
        console.log(`Exit code: ${code}`);
        resolve({ code, out, errOut });
      }).on('data', (d) => {
        const str = d.toString();
        out += str;
        process.stdout.write(str);
      }).stderr.on('data', (d) => {
        const str = d.toString();
        errOut += str;
        process.stderr.write(str);
      });
    });
  });
}

console.log(`Connecting to Hostinger VPS at ${config.host}...`);

conn.on('ready', async () => {
  console.log('✅ Connected to VPS!');
  try {
    // 1. Check current PM2 status
    await runCommand('pm2 list || true');

    // 2. Pull latest git changes in /var/www/gourshal or ~/gourshal
    const deployScript = `
      if [ -d "/var/www/gourshal" ]; then
        cd /var/www/gourshal
        echo "=== Updating /var/www/gourshal ==="
        git fetch --all
        git reset --hard origin/main
        git pull origin main
        npm install --production=false
        npm run build || node scripts/build.js || true
        pm2 restart all || pm2 restart gourshal || systemctl restart gourshal || true
      fi
      if [ -d "$HOME/gourshal" ]; then
        cd $HOME/gourshal
        echo "=== Updating $HOME/gourshal ==="
        git fetch --all
        git reset --hard origin/main
        git pull origin main
        npm install --production=false
        npm run build || node scripts/build.js || true
        pm2 restart all || pm2 restart gourshal || true
      fi
      if [ -f "$HOME/deploy-backend.sh" ]; then
        echo "=== Running ~/deploy-backend.sh ==="
        bash $HOME/deploy-backend.sh || true
      fi
    `;
    await runCommand(deployScript);

    // 3. Clear Nginx cache if nginx is active
    await runCommand('systemctl reload nginx || nginx -s reload || true');
    await runCommand('pm2 list || true');

    console.log('\n🎉 VPS Live Deployment Completed Successfully!');
  } catch (err) {
    console.error('Error during deployment:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH connection failed:', err);
}).connect(config);
