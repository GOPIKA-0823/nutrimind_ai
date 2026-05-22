const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple in-memory storage for testing
const users = [];
const logs = [];

// Simple auth routes for testing
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password, // In real app, this would be hashed
      role,
      createdAt: new Date()
    };

    users.push(user);

    // Simple token (in real app, use JWT)
    const token = `token_${user.id}_${Date.now()}`;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password (in real app, use bcrypt)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Simple token
    const token = `token_${user.id}_${Date.now()}`;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/auth/me', (req, res) => {
  // Simple auth check
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Find user by token (simplified)
  const userId = token.split('_')[1];
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.json({ user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }});
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    users: users.length
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
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;
