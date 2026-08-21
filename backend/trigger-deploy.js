const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'Gourshal@2000'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS! Running ~/deploy-backend.sh...');
  conn.exec('~/deploy-backend.sh', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('\nDeploy finished with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
