// backend/routes/customer.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

const Package = require('../models/Package');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/review');

const resolveCustomerId = async (req) => {
  if (mongoose.Types.ObjectId.isValid(req.user?.id)) {
    return req.user.id;
  }

  if (!req.user?.username) {
    return null;
  }

  const dbUser = await User.findOne({ username: String(req.user.username).toLowerCase() })
    .select('_id')
    .lean();

  return dbUser?._id || null;
};

// ────────────────────────────────────────────────
// GET /api/customer/packages
// Get all active packages
// ────────────────────────────────────────────────
router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find({ active: true })
      .select('name description price pricing duration features image active type')
      .sort({ price: 1 });

    res.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching packages',
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/customer/packages/:id
// Get single package detail
// ────────────────────────────────────────────────
router.get('/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }
    res.json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/customer/bookings
// Get customer's bookings (with optional ?status=pending,accepted filter)
// ────────────────────────────────────────────────
router.get('/bookings', verifyToken, async (req, res) => {
  try {
    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      return res.json({
        success: true,
        count: 0,
        bookings: [],
      });
    }

    console.log('Customer bookings request from user:', customerId);
    const { status } = req.query;
    const filter = { customer: customerId };

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      filter.status = { $in: statuses };
    }

    console.log('Fetching bookings with filter:', filter);
    const bookings = await Booking.find(filter)
      .populate('package', 'name price duration type')
      .populate('detailer', 'name username phone')
      .sort({ scheduledDate: -1, createdAt: -1 });

    console.log('Found bookings:', bookings.length);
    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message,
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/customer/bookings/:id
// Get single booking detail
// ────────────────────────────────────────────────
router.get('/bookings/:id', verifyToken, async (req, res) => {
  try {
    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this booking',
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('package')
      .populate('detailer', 'name username phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customer.toString() !== String(customerId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this booking',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// ────────────────────────────────────────────────
// POST /api/customer/bookings
// Create new booking
// ────────────────────────────────────────────────
router.post('/bookings', verifyToken, async (req, res) => {
  try {
    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in with a registered account to create a booking',
      });
    }

    console.log('Creating booking for customer:', customerId);
    console.log('Booking data:', req.body);
    
    const { packageId, scheduledDate, location, notes, vehicleType } = req.body;

    if (!packageId || !scheduledDate || !location) {
      return res.status(400).json({
        success: false,
        message: 'packageId, scheduledDate and location are required',
      });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.active) {
      return res.status(404).json({
        success: false,
        message: 'Package not found or is no longer active',
      });
    }

    // Extract time from scheduledDate for display purposes
    const dateObj = new Date(scheduledDate);
    const scheduledTime = dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    const booking = new Booking({
      customer: customerId,
      package: packageId,
      scheduledDate: dateObj,
      scheduledTime: scheduledTime,
      vehicleType: vehicleType || '',
      location,
      notes: notes || '',
      status: 'pending',
      totalPrice: pkg.price,
    });

    await booking.save();
    console.log('Booking created successfully:', booking._id);

    // Optional: populate before sending response
    await booking.populate('package');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
});

// ────────────────────────────────────────────────
// DELETE /api/customer/bookings/:id
// Cancel booking (only if still pending)
// ────────────────────────────────────────────────
router.delete('/bookings/:id', verifyToken, async (req, res) => {
  try {
    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customer.toString() !== String(customerId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (!['pending'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking in status: ${booking.status}`,
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
    });
  }
});

// ────────────────────────────────────────────────
// PUT /api/customer/profile
// Update customer profile
// ────────────────────────────────────────────────
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const isDevTokenUser = !mongoose.Types.ObjectId.isValid(req.user?.id);

    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      if (isDevTokenUser) {
        return res.json({
          success: true,
          message: 'Profile updated (dev session, not persisted)',
          user: {
            id: req.user?.id,
            username: req.user?.username,
            role: req.user?.role,
            name: name || req.user?.name || req.user?.username,
            email: email || req.user?.email,
            phone: phone || '',
            profilePicture: '',
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name !== undefined) user.name = String(name).trim();
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (phone !== undefined) user.phone = String(phone).trim();

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

// ────────────────────────────────────────────────
// PUT /api/customer/settings/notifications
// Update customer notification preferences
// ────────────────────────────────────────────────
router.put('/settings/notifications', verifyToken, async (req, res) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
    } = req.body;
    const isDevTokenUser = !mongoose.Types.ObjectId.isValid(req.user?.id);

    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      if (isDevTokenUser) {
        return res.json({
          success: true,
          message: 'Notification settings updated (dev session, not persisted)',
          notificationSettings: {
            emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : true,
            smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : true,
            pushNotifications: pushNotifications !== undefined ? Boolean(pushNotifications) : true,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.notificationSettings = {
      emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : user.notificationSettings?.emailNotifications ?? true,
      smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : user.notificationSettings?.smsNotifications ?? true,
      pushNotifications: pushNotifications !== undefined ? Boolean(pushNotifications) : user.notificationSettings?.pushNotifications ?? true,
    };

    await user.save();

    return res.json({
      success: true,
      message: 'Notification settings updated',
      notificationSettings: user.notificationSettings,
    });
  } catch (error) {
    console.error('Notification settings update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/customer/reviews
// Get customer reviews
// ────────────────────────────────────────────────
router.get('/reviews', verifyToken, async (req, res) => {
  try {
    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      return res.json({
        success: true,
        count: 0,
        reviews: [],
      });
    }

    const reviews = await Review.find({ customer: customerId })
      .populate('detailer', 'name username')
      .populate({
        path: 'booking',
        populate: { path: 'package', select: 'name' },
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Get customer reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
    });
  }
});

// ────────────────────────────────────────────────
// POST /api/customer/bookings/:id/review
// Create a review for a completed booking
// ────────────────────────────────────────────────
router.post('/bookings/:id/review', verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const customerId = await resolveCustomerId(req);
    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in with a registered account to submit a review',
      });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (String(booking.customer) !== String(customerId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed bookings can be reviewed',
      });
    }

    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been reviewed',
      });
    }

    const review = await Review.create({
      booking: booking._id,
      customer: booking.customer,
      detailer: booking.detailer,
      rating: Number(rating),
      comment: comment ? String(comment).trim() : '',
    });

    booking.reviewed = true;
    await booking.save();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review',
    });
  }
});

module.exports = router;