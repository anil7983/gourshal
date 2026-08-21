const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'Gourshal@2000'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS! Running deep diagnostic...');
  conn.exec(`
    echo "=== 1. PM2 STATUS ==="
    pm2 status
    echo ""
    echo "=== 2. PM2 ERROR LOGS ==="
    pm2 logs gourshal --lines 20 --nostream
    echo ""
    echo "=== 3. NGINX STATUS & CONFIG TEST ==="
    systemctl status nginx --no-pager
    nginx -t
    echo ""
    echo "=== 4. SITES ENABLED ==="
    ls -la /etc/nginx/sites-enabled/
    echo ""
    echo "=== 5. NGINX GOURSHAL CONFIG CONTENT ==="
    cat /etc/nginx/sites-available/gourshal
    echo ""
    echo "=== 6. LOCAL CURL 5000 (Node.js Direct) ==="
    curl -s -i http://127.0.0.1:5000/ | head -n 25
    echo ""
    echo "=== 7. LOCAL CURL 80 (Nginx HTTP) ==="
    curl -s -i http://127.0.0.1/ | head -n 25
    echo ""
    echo "=== 8. LOCAL CURL 443 (Nginx HTTPS) ==="
    curl -k -s -i https://127.0.0.1/ | head -n 25
    echo ""
    echo "=== 9. DNS LOOKUP / HOSTS ==="
    host gourshal.com || nslookup gourshal.com || true
    echo ""
    echo "=== 10. UFW / FIREWALL ==="
    ufw status || iptables -L -n -v | head -n 20 || true
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('\nFinished diagnostic with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
