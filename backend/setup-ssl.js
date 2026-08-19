const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || ''
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Running Certbot for SSL...');
  const sslEmail = process.env.SSL_EMAIL || 'admin@gourshal.com';
  conn.exec(`
    certbot --nginx -d gourshal.com -d www.gourshal.com --non-interactive --agree-tos --email ${sslEmail} --redirect || certbot --nginx -d gourshal.com --non-interactive --agree-tos --email ${sslEmail} --redirect
    systemctl reload nginx
    echo "--- SSL Status ---"
    nginx -t
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Certbot finished with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
