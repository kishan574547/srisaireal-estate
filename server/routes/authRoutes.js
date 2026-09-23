const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Strict rate limiter for login endpoint to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD || '';

  if (
    normalizedEmail === envAdminEmail &&
    password === envAdminPassword
  ) {
    const token = jwt.sign(
      { email: normalizedEmail, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: { email: normalizedEmail, role: 'admin' },
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password' });
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    res.json({ success: true, admin: decoded });
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
});

module.exports = router;