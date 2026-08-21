const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'Gourshal@2000'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected! Enabling SSL/HTTPS on Nginx via Certbot...');
  conn.exec(`
    certbot --nginx -d gourshal.com -d www.gourshal.com --non-interactive --agree-tos --email rajy23636@gmail.com --redirect --reinstall
    nginx -t
    systemctl reload nginx
    echo ""
    echo "=== Nginx Config After SSL ==="
    cat /etc/nginx/sites-available/gourshal
    echo ""
    echo "=== Testing HTTPS (Port 443) ==="
    curl -k -s -i https://127.0.0.1/ | head -n 25
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('SSL configuration finished with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
