// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    detailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null until assigned
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleType: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      address: {
        type: String,
        trim: true,
      },
      latitude: Number,
      longitude: Number,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    images: {
      before: [{
        type: String,
        trim: true,
      }],
      after: [{
        type: String,
        trim: true,
      }],
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
