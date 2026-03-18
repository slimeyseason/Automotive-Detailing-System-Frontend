// backend/models/Package.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: false, // Now optional since we have pricing tiers
      min: [0, 'Price cannot be negative'],
    },
    pricing: {
      sedan: { type: Number, min: 0 },
      suv: { type: Number, min: 0 },
      truck: { type: Number, min: 0 },
      van: { type: Number, min: 0 },
    },
    duration: {
      type: String,
      default: '1 hour', // e.g., "1 hour", "2 hours", "30 minutes"
    },
    type: {
      type: String,
      default: 'Standard Services Packages',
      enum: [
        'Standard Services Packages',
        'Specialized & High-End Services',
        'Individual Add-On Services'
      ],
    },
    features: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
