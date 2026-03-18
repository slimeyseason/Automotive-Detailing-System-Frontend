// backend/routes/detailer.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

// ────────────────────────────────────────────────
// Configure multer for job images
// ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/jobs'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `job-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  },
});

// ────────────────────────────────────────────────
// GET /api/detailer/jobs
// Get all jobs for the detailer (assigned or pending)
// ────────────────────────────────────────────────
router.get('/jobs', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build filter: jobs assigned to this detailer OR pending jobs
    const filter = {
      $or: [
        { detailer: req.user.id },
        { status: 'pending', detailer: null }
      ]
    };

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      filter.status = { $in: statuses };
    }

    const jobs = await Booking.find(filter)
      .populate('package', 'name price duration type')
      .populate('customer', 'name phone')
      .populate('detailer', 'name phone')
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching detailer jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/detailer/jobs/today
// Get today's jobs for the detailer
// ────────────────────────────────────────────────
router.get('/jobs/today', verifyToken, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Build filter: jobs for today assigned to this detailer OR pending jobs for today
    const filter = {
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      $or: [
        { detailer: req.user.id },
        { status: 'pending', detailer: null }
      ]
    };

    const jobs = await Booking.find(filter)
      .populate('package', 'name price duration type')
      .populate('customer', 'name phone')
      .populate('detailer', 'name phone')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching today\'s jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s jobs',
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/detailer/jobs/history
// Get completed and cancelled jobs for the detailer
// ────────────────────────────────────────────────
router.get('/jobs/history', verifyToken, async (req, res) => {
  try {
    const jobs = await Booking.find({
      detailer: req.user.id,
      status: { $in: ['completed', 'cancelled'] }
    })
      .populate('package', 'name price duration type')
      .populate('customer', 'name phone')
      .populate('detailer', 'name phone')
      .sort({ updatedAt: -1, scheduledDate: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching job history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job history',
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/detailer/jobs/:id
// Get single job detail
// ────────────────────────────────────────────────
router.get('/jobs/:id', verifyToken, async (req, res) => {
  try {
    const job = await Booking.findById(req.params.id)
      .populate('package')
      .populate('customer', 'name phone')
      .populate('detailer', 'name phone');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if detailer has access to this job
    if (job.detailer && job.detailer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this job',
      });
    }

    res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
    });
  }
});

// ────────────────────────────────────────────────
// PATCH /api/detailer/jobs/:id/accept
// Accept a pending job
// ────────────────────────────────────────────────
router.patch('/jobs/:id/accept', verifyToken, async (req, res) => {
  try {
    const job = await Booking.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept job with status: ${job.status}`,
      });
    }

    if (job.detailer && job.detailer.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Job already assigned to another detailer',
      });
    }

    job.status = 'accepted';
    job.detailer = req.user.id;
    await job.save();

    await job.populate('package customer detailer');

    res.json({
      success: true,
      message: 'Job accepted successfully',
      job,
    });
  } catch (error) {
    console.error('Error accepting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept job',
    });
  }
});

// ────────────────────────────────────────────────
// PATCH /api/detailer/jobs/:id/reject
// Reject a pending job
// ────────────────────────────────────────────────
router.patch('/jobs/:id/reject', verifyToken, async (req, res) => {
  try {
    const job = await Booking.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject job with status: ${job.status}`,
      });
    }

    // For now, just mark as cancelled or keep pending for other detailers
    // You could implement a rejection tracking system here
    job.status = 'cancelled';
    job.cancelledAt = new Date();
    await job.save();

    res.json({
      success: true,
      message: 'Job rejected',
      job,
    });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject job',
    });
  }
});

// ────────────────────────────────────────────────
// PATCH /api/detailer/jobs/:id
// Update job status (en_route, arrived, in_progress, completed)
// ────────────────────────────────────────────────
router.patch('/jobs/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Booking.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!job.detailer || job.detailer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this job',
      });
    }

    const validStatuses = ['accepted', 'en_route', 'arrived', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    job.status = status;
    await job.save();

    await job.populate('package customer detailer');

    res.json({
      success: true,
      message: 'Job status updated',
      job,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
    });
  }
});

// ────────────────────────────────────────────────
// POST /api/detailer/jobs/:id/images
// Upload before/after images for a job
// ────────────────────────────────────────────────
router.post('/jobs/:id/images', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const { type } = req.body; // 'before' or 'after'
    const job = await Booking.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!job.detailer || job.detailer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this job',
      });
    }

    if (!['before', 'after'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Image type must be "before" or "after"',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    // Initialize images object if it doesn't exist
    if (!job.images) {
      job.images = { before: [], after: [] };
    }

    // Store relative paths
    const imagePaths = req.files.map(file => `/uploads/jobs/${file.filename}`);
    
    if (type === 'before') {
      job.images.before = [...(job.images.before || []), ...imagePaths];
    } else {
      job.images.after = [...(job.images.after || []), ...imagePaths];
    }

    await job.save();

    res.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} images uploaded successfully`,
      images: job.images,
      uploadedPaths: imagePaths,
    });
  } catch (error) {
    console.error('Error uploading job images:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images',
    });
  }
});

// ────────────────────────────────────────────────
// GET /api/detailer/earnings
// Get earnings summary for detailer
// ────────────────────────────────────────────────
router.get('/earnings', verifyToken, async (req, res) => {
  try {
    const completedJobs = await Booking.find({
      detailer: req.user.id,
      status: 'completed',
    }).select('totalPrice');

    // Detailers earn 30% of each package price
    const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.totalPrice * 0.30), 0);

    const pendingJobs = await Booking.find({
      detailer: req.user.id,
      status: { $in: ['accepted', 'en_route', 'arrived', 'in_progress'] },
    }).select('totalPrice');

    const pendingPayment = pendingJobs.reduce((sum, job) => sum + (job.totalPrice * 0.30), 0);

    res.json({
      success: true,
      detailerId: req.user.id,
      totalEarnings,
      completedJobs: completedJobs.length,
      pendingPayment,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
    });
  }
});

module.exports = router;
