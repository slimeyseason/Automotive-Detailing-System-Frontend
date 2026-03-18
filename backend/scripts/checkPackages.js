// backend/scripts/checkPackages.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Package = require('../models/Package');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const packages = await Package.find().sort({ type: 1, name: 1 }).lean();
    console.log(`Found ${packages.length} packages:\n`);
    
    if (packages.length === 0) {
      console.log('⚠️  No packages in database!');
    } else {
      packages.forEach(p => {
        console.log(`📦 ${p.name}`);
        console.log(`   Type: ${p.type}`);
        console.log(`   Price: KSh ${p.price}`);
        console.log(`   Duration: ${p.duration}`);
        console.log(`   Active: ${p.active ? 'Yes' : 'No'}`);
        if (p.image) console.log(`   Image: ${p.image}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
