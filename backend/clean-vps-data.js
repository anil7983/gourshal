const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '200.234.39.211',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'Gourshal@2000'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS! Cleaning test data from MongoDB...');
  conn.exec(`
cat > /var/www/gourshal/clear-test-data.js << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');

async function clean() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  
  // 1. Delete all test orders
  const ordersDeleted = await Order.deleteMany({});
  console.log('Deleted orders:', ordersDeleted.deletedCount);
  
  // 2. Delete test users (keep admin accounts)
  const usersDeleted = await User.deleteMany({
    role: 'user',
    email: { $ne: 'admin@gourshal.com' }
  });
  console.log('Deleted test users:', usersDeleted.deletedCount);
  
  const remainingUsers = await User.find({}, 'name email role');
  console.log('Remaining users:', remainingUsers);
  
  await mongoose.disconnect();
  console.log('Done!');
}
clean().catch(console.error);
EOF

cd /var/www/gourshal && node clear-test-data.js && rm clear-test-data.js
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('\nClear test data finished with code', code);
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect(config);
