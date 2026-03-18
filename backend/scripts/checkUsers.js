// backend/scripts/checkUsers.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV;

console.log('=== Admin Login Debug Info ===');
console.log('NODE_ENV:', NODE_ENV);
console.log('MONGODB_URI:', MONGODB_URI ? 'Set ✓' : 'Not Set ✗');
console.log('Dev mode enabled:', NODE_ENV === 'development' || !NODE_ENV);
console.log('');

if (!MONGODB_URI) {
  console.error('MONGO_URI is not set. Update backend/.env first.');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const users = await User.find({}, 'username email role createdAt');
    console.log(`Found ${users.length} users in database:`);
    
    if (users.length === 0) {
      console.log('\n⚠️  No users in database!');
      console.log('\nTo create an admin user, run:');
      console.log('  node scripts/addAdmin.js');
      console.log('\nOr change NODE_ENV to "development" in .env to use hardcoded dev credentials');
    } else {
      users.forEach(u => {
        console.log(`- ${u.username.padEnd(15)} | ${u.email.padEnd(25)} | ${u.role.padEnd(10)} | ${u.createdAt.toISOString().split('T')[0]}`);
      });
      
      const adminCount = users.filter(u => u.role === 'admin').length;
      console.log(`\n✓ Found ${adminCount} admin user(s)`);
      
      if (adminCount === 0) {
        console.log('\n⚠️  No admin users found!');
        console.log('Run: node scripts/addAdmin.js');
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Database error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
