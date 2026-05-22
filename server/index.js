const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const logRoutes = require('./routes/logs');
const reportRoutes = require('./routes/reports');
const appointmentRoutes = require('./routes/appointments');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctors');
const messageRoutes = require('./routes/messages');
const Admin = require('./models/Admin');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      // For development convenience, allow reflection if not strictly matched
      callback(null, true);
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed default admin (idempotent)
async function ensureDefaultAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping default admin seed.');
      }
      return;
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return;
    }

    const admin = new Admin({
      name: process.env.ADMIN_NAME || 'System Administrator',
      email,
      password,
      isActive: true
    });
    await admin.save();
    console.log(`Default admin created: ${email}`);
  } catch (e) {
    console.error('Failed to ensure default admin:', e);
  }
}

// Kick off seeding after connection is ready
mongoose.connection.once('open', () => {
  ensureDefaultAdmin();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
