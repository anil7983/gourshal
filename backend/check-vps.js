const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || ''
};

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH ready, running diagnostic...');
  conn.exec(`
    ls -la /var/www/gourshal
    echo "--- PM2 Status ---"
    pm2 status
    echo "--- Port 5000 / Nginx ---"
    curl -i http://127.0.0.1:5000/api/health || true
    curl -i http://127.0.0.1/api/health || true
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Finished with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
