// Script to create a doctor user for testing
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

const createDoctor = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database');

    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email: 'dr.johnson@nutrimind.com' });
    if (existingDoctor) {
      console.log('👨‍⚕️ Doctor already exists:', existingDoctor._id);
      console.log('Doctor ID:', existingDoctor._id.toString());
      process.exit(0);
    }

    // Create doctor user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const doctor = new User({
      name: 'Dr. Johnson',
      email: 'dr.johnson@nutrimind.com',
      password: hashedPassword,
      role: 'doctor',
      profile: {
        bio: 'Internal Medicine Specialist',
        specialization: 'Internal Medicine',
        experience: 15,
        rating: 4.9,
        patientsCount: 1200
      }
    });

    await doctor.save();
    console.log('👨‍⚕️ Doctor created successfully!');
    console.log('Doctor ID:', doctor._id.toString());
    console.log('Email: dr.johnson@nutrimind.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating doctor:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createDoctor();
