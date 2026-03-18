const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // These are no longer needed in Mongoose 7+ / 2025, but harmless
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully ✅');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit if can't connect (good for dev)
  }
};

module.exports = connectDB;