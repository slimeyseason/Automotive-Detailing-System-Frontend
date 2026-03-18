// backend/scripts/addAdmin.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.findIndex((a) => a === name);
  return idx >= 0 ? args[idx + 1] : undefined;
};

const username = getArg('--username') || 'admin';
const email = getArg('--email') || 'admin@ads.local';
const password = getArg('--password') || 'admin123';
const name = getArg('--name') || 'Admin User';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGO_URI is not set. Update backend/.env first.');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({
      $or: [
        { username: username.trim().toLowerCase() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existing) {
      console.log('\n⚠️  Admin user already exists:');
      console.log({
        id: existing._id.toString(),
        username: existing.username,
        email: existing.email,
        role: existing.role,
      });
      console.log('\nIf you want to reset the password, use:');
      console.log(`node scripts/resetPassword.js --username ${existing.username} --password <newPassword>`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create new admin user
    const admin = new User({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: password, // will be hashed by pre-save hook
      name: name,
      role: 'admin',
      isActive: true,
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully:');
    console.log({
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });
    console.log('\nYou can now login with:');
    console.log(`  Username: ${admin.username}`);
    console.log(`  Password: ${password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
