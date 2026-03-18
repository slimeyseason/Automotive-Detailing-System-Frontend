
// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User'); // adjust path if your model is named differently
// ────────────────────────────────────────────────
// DEV-ONLY: Endpoint to get dev credentials for frontend
// ────────────────────────────────────────────────
router.get('/dev-credentials', (req, res) => {
  if (!isDevMode) {
    return res.status(403).json({ success: false, message: 'Not available in production' });
  }
  res.json({
    success: true,
    credentials: {
      admin: { username: DEV_ADMIN.username, password: DEV_ADMIN.password },
      customer: { username: DEV_CUSTOMER.username, password: DEV_CUSTOMER.password },
      detailer: { username: DEV_DETAILER.username, password: DEV_DETAILER.password },
    }
  });
});

// ────────────────────────────────────────────────
// DEVELOPMENT-ONLY: Hardcoded dev credentials for admin, customer, detailer
// Remove or disable this block in production!
// ────────────────────────────────────────────────
const DEV_ADMIN = {
  id: 'dev-admin-001',
  username: 'admin',
  email: 'admin@ads.local',
  role: 'admin',
  password: 'admin123'           // plaintext – dev only
};
const DEV_CUSTOMER = {
  id: 'dev-customer-001',
  username: 'customer',
  email: 'customer@ads.local',
  role: 'customer',
  password: 'customer123'
};
const DEV_DETAILER = {
  id: 'dev-detailer-001',
  username: 'detailer',
  email: 'detailer@ads.local',
  role: 'detailer',
  password: 'detailer123'
};

const isDevMode = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const normalizePhone = (rawPhone) => {
  if (!rawPhone) return null;

  const cleaned = String(rawPhone).trim().replace(/\s+/g, '');
  if (!cleaned) return null;

  if (/^0[17]\d{8}$/.test(cleaned)) {
    return `+254${cleaned.slice(1)}`;
  }

  if (/^254[17]\d{8}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  if (/^\+254[17]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^\+?[1-9]\d{1,14}$/.test(cleaned)) {
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  return null;
};

// ────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password: '***' }); // mask password in logs

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  try {
    let user = null;
    let isDevLogin = false;

    // Hardcoded dev fallback (only in development)
    if (isDevMode) {
      const uname = username.trim().toLowerCase();
      if (uname === DEV_ADMIN.username.toLowerCase() && password === DEV_ADMIN.password) {
        user = { ...DEV_ADMIN };
        isDevLogin = true;
        console.log('⚠️  DEV MODE: Logged in as hardcoded admin');
      } else if (uname === DEV_CUSTOMER.username.toLowerCase() && password === DEV_CUSTOMER.password) {
        user = { ...DEV_CUSTOMER };
        isDevLogin = true;
        console.log('⚠️  DEV MODE: Logged in as hardcoded customer');
      } else if (uname === DEV_DETAILER.username.toLowerCase() && password === DEV_DETAILER.password) {
        user = { ...DEV_DETAILER };
        isDevLogin = true;
        console.log('⚠️  DEV MODE: Logged in as hardcoded detailer');
      }
    }

    // Real database lookup
    if (!user) {
      user = await User.findOne({
        $or: [
          { username: username.trim().toLowerCase() },
          { email: username.trim().toLowerCase() }
        ]
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'Account has no password set. Please reset your password or contact support.'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id || user.id,          // support both DB and dev object
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'change-this-in-production-very-secure-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: isDevLogin ? 'Logged in using development admin account' : undefined
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ────────────────────────────────────────────────
// POST /api/auth/register  (for customers)
// ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, password, email, phone, name } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  const normalizedPhone = normalizePhone(phone);
  if (phone && !normalizedPhone) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid phone number (e.g. 07XXXXXXXX or +2547XXXXXXXX)'
    });
  }

  try {
    // Check for existing user
    const existing = await User.findOne({
      $or: [
        { username: username.trim().toLowerCase() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Create new user (default role = customer)
    const newUser = new User({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      phone: normalizedPhone,
      name: name || null,
      role: 'customer'
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'change-this-in-production-very-secure-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors || {})[0];
      return res.status(400).json({
        success: false,
        message: firstError?.message || 'Invalid registration details'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Optional: unprotected /me endpoint for quick testing
router.get('/me', (req, res) => {
  res.json({
    success: true,
    message: 'This endpoint should be protected by verifyToken in production'
  });
});

module.exports = router;