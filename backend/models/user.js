// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      lowercase: true, // normalize for consistency
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // automatically exclude from queries unless explicitly included
    },

    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    phone: {
      type: String,
      trim: true,
      sparse: true, // allows multiple null values
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },

    role: {
      type: String,
      enum: {
        values: ['customer', 'detailer', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'customer',
    },

    profilePicture: {
      type: String,
      default: 'https://example.com/default-avatar.png', // or use a real default URL
    },

    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

// ────────────────────────────────────────────────
// Password hashing middleware (async/await version)
// ────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// ────────────────────────────────────────────────
// Method to compare password
// ────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Optional: method to get public profile (hide sensitive fields)
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);