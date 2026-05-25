require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes     = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/properties', propertyRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Sri Sai Real Estate API ✅', status: 'running', port: PORT });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
      console.log(`👤 Admin email    → ${process.env.ADMIN_EMAIL}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });