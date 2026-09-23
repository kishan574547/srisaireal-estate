const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const propertyRoutes = require('./routes/propertyRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// SECURITY HEADERS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows serving uploaded media across origins
  })
);
app.disable('x-powered-by');

// CORS CONFIGURATION
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      // or whitelisted origins, or any Vercel deployment domain
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// RATE LIMITING FOR ALL API ROUTES
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// BODY PARSERS WITH SIZE LIMITS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// NOSQL INJECTION SANITIZATION
app.use(mongoSanitize());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// HEALTH CHECK ROUTE
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sri Sai Real Estate API is operational',
    status: 'healthy',
  });
});

// 404 NOT FOUND HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// CENTRALIZED ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size limit exceeded (maximum 10MB per image)',
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded (maximum 10 images)',
    });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: CORS origin not allowed',
    });
  }

  // Generic production error masking
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'An unexpected server error occurred' : (err.message || 'Internal Server Error'),
  });
});

// CONNECT MONGODB & START SERVER
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  if (!process.env.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB Connected');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
    });
}

module.exports = app;