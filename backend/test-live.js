const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || ''
};

const conn = new Client();

conn.on('ready', () => {
  conn.exec(`
    sleep 2
    echo "--- PM2 Logs ---"
    pm2 logs gourshal --lines 20 --nostream
    echo "--- Testing Health ---"
    curl -i http://127.0.0.1/api/health
    echo ""
    echo "--- Testing Products API ---"
    curl -s http://127.0.0.1/api/products | head -c 200
    echo ""
    echo "--- Testing HTML Page ---"
    curl -s http://127.0.0.1/ | head -n 10
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
