// backend/routes/admin.js
const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const multer = require('multer');
const path = require('path');

// IMPORTANT: Create the router instance
const router = express.Router();

// ────────────────────────────────────────────────
// Multer configuration for image uploads
// ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/packages/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'package-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }
});

// ────────────────────────────────────────────────
// Middleware: Verify admin role
// ────────────────────────────────────────────────
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
    next();
  });
};

// ────────────────────────────────────────────────
// GET /admin/stats/overview
// ────────────────────────────────────────────────
router.get('/stats/overview', verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      totalBookings,
      todayBookings,
      activeDetailers,
      revenueAgg,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ scheduledDate: { $gte: startOfDay, $lt: endOfDay } }),
      User.countDocuments({ role: 'detailer', isActive: true }),
      Booking.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startOfMonth, $lt: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const revenueThisMonth = revenueAgg?.[0]?.total ?? 0;

    res.json({
      totalBookings,
      todayBookings,
      revenueThisMonth,
      activeDetailers,
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats',
    });
  }
});

// ────────────────────────────────────────────────
// GET /admin/detailers
// ────────────────────────────────────────────────
router.get('/detailers', verifyAdmin, async (req, res) => {
  try {
    const detailers = await User.find({ role: 'detailer' })
      .select('-password')
      .lean();

    res.json(
      detailers.map(d => ({
        id: d._id,
        username: d.username,
        name: d.name,
        phone: d.phone,
        email: d.email,
        status: d.status || 'active',
        rating: d.rating || 0,
        totalJobs: d.totalJobs || 0,
        joinedAt: d.createdAt?.toISOString().split('T')[0] || 'N/A',
        isAvailable: d.isAvailable ?? false,
      }))
    );
  } catch (err) {
    console.error('Error fetching detailers:', err);
    res.status(500).json({ error: 'Failed to fetch detailers' });
  }
});

// ────────────────────────────────────────────────
// POST /admin/detailers - Add new detailer
// ────────────────────────────────────────────────
router.post('/detailers', verifyAdmin, async (req, res) => {
  try {
    console.log('Add detailer request:', req.body);
    const { username, name, phone, email, password } = req.body;

    if (!username || !name || !phone || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        message: 'Username must be at least 3 characters' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    const existing = await User.findOne({
      $or: [
        { username: username.trim().toLowerCase() },
        { email: email.trim().toLowerCase() },
        { phone: phone.trim() },
      ],
    });

    if (existing) {
      return res.status(409).json({ 
        success: false,
        message: 'Username, email, or phone already in use' 
      });
    }

    const newDetailer = new User({
      username: username.trim().toLowerCase(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'detailer',
      status: 'active',
      rating: 0,
      totalJobs: 0,
      isAvailable: true,
    });

    await newDetailer.save();
    console.log('Detailer created successfully:', newDetailer._id);

    res.status(201).json({
      success: true,
      message: 'Detailer added successfully',
      detailer: {
        id: newDetailer._id,
        username: newDetailer.username,
        name: newDetailer.name,
        phone: newDetailer.phone,
        email: newDetailer.email,
        status: newDetailer.status,
        rating: newDetailer.rating,
        totalJobs: newDetailer.totalJobs,
        joinedAt: newDetailer.createdAt.toISOString().split('T')[0],
        isAvailable: newDetailer.isAvailable,
      }
    });
  } catch (err) {
    console.error('Error adding detailer:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to add detailer' 
    });
  }
});

// ────────────────────────────────────────────────
// POST /admin/upload/image - Upload package image
// ────────────────────────────────────────────────
router.post('/upload/image', verifyAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Return the URL path to access the image
    const imageUrl = `/uploads/packages/${req.file.filename}`;
    
    res.json({
      success: true,
      url: imageUrl,
      imageUrl: imageUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ────────────────────────────────────────────────
// Package Management Routes
// ────────────────────────────────────────────────

// GET /admin/packages - Get all packages
router.get('/packages', verifyAdmin, async (req, res) => {
  try {
    const packages = await Package.find().sort({ type: 1, name: 1 }).lean();
    res.json(packages);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// GET /admin/packages/:id - Get single package
router.get('/packages/:id', verifyAdmin, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.json(pkg);
  } catch (err) {
    console.error('Error fetching package:', err);
    res.status(500).json({ error: 'Failed to fetch package' });
  }
});

// POST /admin/packages - Create new package
router.post('/packages', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, pricing, duration, type, image, active, features } = req.body;

    if (!name || !duration) {
      return res.status(400).json({ error: 'Name and duration are required' });
    }

    const newPackage = new Package({
      name: name.trim(),
      description: description?.trim(),
      price: Number(price) || 0,
      pricing: pricing || {},
      duration: duration.trim(),
      type: type || 'Standard Services Packages',
      image: image || '',
      active: active !== undefined ? active : true,
      features: features || [],
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (err) {
    console.error('Error creating package:', err);
    res.status(500).json({ error: 'Failed to create package', message: err.message });
  }
});

// PUT /admin/packages/:id - Update package
router.put('/packages/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, pricing, duration, type, image, active, features } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (pricing !== undefined) updateData.pricing = pricing;
    if (duration) updateData.duration = duration.trim();
    if (type) updateData.type = type;
    if (image !== undefined) updateData.image = image;
    if (active !== undefined) updateData.active = active;
    if (features !== undefined) updateData.features = features;

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(updatedPackage);
  } catch (err) {
    console.error('Error updating package:', err);
    res.status(500).json({ error: 'Failed to update package', message: err.message });
  }
});

// DELETE /admin/packages/:id - Delete package
router.delete('/packages/:id', verifyAdmin, async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);
    
    if (!deletedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    console.error('Error deleting package:', err);
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

// ────────────────────────────────────────────────
// Other routes (add more as needed)
// ────────────────────────────────────────────────

// ────────────────────────────────────────────────
// GET /admin/bookings - Get all bookings with filters
// ────────────────────────────────────────────────
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    console.log('Admin bookings request - Query params:', req.query);
    const { page = 1, limit = 10, status, search, from, to } = req.query;

    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (from || to) {
      query.scheduledDate = {};
      if (from) {
        query.scheduledDate.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.scheduledDate.$lte = toDate;
      }
    }

    console.log('MongoDB query filter:', query);

    // Build base query
    let bookingsQuery = Booking.find(query)
      .populate('customer', 'name phone email')
      .populate('package', 'name price duration')
      .populate('detailer', 'name phone')
      .sort({ createdAt: -1 });

    // Execute query
    const bookings = await bookingsQuery
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log('Found bookings before search filter:', bookings.length);

    // Search filter (applied in memory for simplicity)
    let filteredBookings = bookings;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBookings = bookings.filter(booking => {
        return (
          booking.customer?.name?.toLowerCase().includes(searchLower) ||
          booking.customer?.phone?.includes(search) ||
          booking._id.toString().includes(search)
        );
      });
      console.log('Found bookings after search filter:', filteredBookings.length);
    }

    // Count total for pagination
    const total = await Booking.countDocuments(query);
    console.log('Total bookings in DB matching filter:', total);

    res.json({
      success: true,
      bookings: filteredBookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
    });
  }
});

// ────────────────────────────────────────────────
// GET /admin/bookings/:id - Get single booking detail
// ────────────────────────────────────────────────
router.get('/bookings/:id', verifyAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('package', 'name price duration features')
      .populate('detailer', 'name phone email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
    });
  }
});

// ────────────────────────────────────────────────
// PATCH /admin/bookings/:id - Update booking (admin override)
// ────────────────────────────────────────────────
router.patch('/bookings/:id', verifyAdmin, async (req, res) => {
  try {
    const { status, detailer, notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    if (status) {
      booking.status = status;
    }
    if (detailer !== undefined) {
      booking.detailer = detailer;
    }
    if (notes !== undefined) {
      booking.notes = notes;
    }

    await booking.save();
    await booking.populate('customer package detailer');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking',
    });
  }
});

// ────────────────────────────────────────────────
// DELETE /admin/bookings/:id - Delete booking
// ────────────────────────────────────────────────
router.delete('/bookings/:id', verifyAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete booking',
    });
  }
});

module.exports = router;