// backend/scripts/resetPassword.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.findIndex((a) => a === name);
  return idx >= 0 ? args[idx + 1] : undefined;
};

const username = getArg('--username');
const email = getArg('--email');
const password = getArg('--password');

if (!password || (!username && !email)) {
  console.error('Usage: node scripts/resetPassword.js --username <username> --password <newPassword>');
  console.error('   or: node scripts/resetPassword.js --email <email> --password <newPassword>');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGO_URI is not set. Update backend/.env first.');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(MONGODB_URI);

  const query = username
    ? { username: username.trim().toLowerCase() }
    : { email: email.trim().toLowerCase() };

  const user = await User.findOne(query);
  if (!user) {
    console.error('User not found for:', query);
    process.exit(1);
  }

  user.password = password; // will be hashed by pre-save hook
  await user.save();

  console.log('Password reset successful for:', {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  });

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Password reset failed:', err.message);
  process.exit(1);
});
