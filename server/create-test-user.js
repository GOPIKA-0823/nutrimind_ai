// Script to create a test user for testing appointments
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'doctor'], default: 'user' },
  profile: {
    avatar: String,
    bio: String,
    specialization: String,
    experience: Number,
    rating: Number,
    patientsCount: Number
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createTestUser = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to database');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('👤 Test user already exists:', existingUser._id.toString());
      console.log('Email: test@example.com');
      console.log('Password: password123');
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });

    await user.save();
    console.log('👤 Test user created successfully!');
    console.log('User ID:', user._id.toString());
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestUser();
