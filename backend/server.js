// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Load backend/.env reliably

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const detailerRoutes = require('./routes/detailer');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ────────────────────────────────────────────────
// Create uploads directory if it doesn't exist
// ────────────────────────────────────────────────
const uploadsPackagesDir = path.join(__dirname, 'uploads', 'packages');
if (!fs.existsSync(uploadsPackagesDir)) {
  fs.mkdirSync(uploadsPackagesDir, { recursive: true });
  console.log('✓ Created uploads/packages directory');
}

const uploadsJobsDir = path.join(__dirname, 'uploads', 'jobs');
if (!fs.existsSync(uploadsJobsDir)) {
  fs.mkdirSync(uploadsJobsDir, { recursive: true });
  console.log('✓ Created uploads/jobs directory');
}

// ────────────────────────────────────────────────
//  Middleware
// ────────────────────────────────────────────────

// Security headers
app.use(helmet());

// Rate limiting (basic protection against brute-force / spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                 // limit each IP to 200 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS – adjust origin(s) in production
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., curl, Postman) with no origin
    if (!origin) return callback(null, true);

    const allowedOrigins = new Set([
      'http://localhost:5173',           // Vite dev
      'http://localhost:3000',           // if using CRA sometimes
      process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
    ]);

    const isLocalhost = /^http:\/\/localhost:\d+$/i.test(origin);
    const isLanDev = /^http:\/\/192\.168\.\d+\.\d+:\d+$/i.test(origin);

    if (allowedOrigins.has(origin) || isLocalhost || isLanDev) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory with CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ────────────────────────────────────────────────
//  MongoDB Connection – optional for dev/testing
// ────────────────────────────────────────────────
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => {
      const isAtlas = mongoUri.includes('mongodb.net');
      console.log('✓ MongoDB connected successfully!');
      console.log(`Database type: ${isAtlas ? 'MongoDB Atlas (online)' : 'MongoDB (local/self-hosted)'}`);
    })
    .catch(err => {
      console.warn('⚠ MongoDB connection failed (skipping DB):', err.message);
      if (err.message && err.message.includes('querySrv ECONNREFUSED')) {
        console.warn('Hint: Your network/DNS is blocking MongoDB SRV lookups. Use a direct mongodb:// host list URI or switch DNS (8.8.8.8 / 1.1.1.1).');
      }
    });
} else {
  console.warn('⚠ No MONGO_URI/MONGODB_URI provided. Skipping MongoDB connection.');
}

// ────────────────────────────────────────────────
//  Routes
// ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/detailer', detailerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ADS Backend is running',
    uptime: process.uptime().toFixed(0) + ' seconds',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('✗ Error:', err.stack);
  
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: status === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ────────────────────────────────────────────────
//  Start Server
// ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 ADS Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});