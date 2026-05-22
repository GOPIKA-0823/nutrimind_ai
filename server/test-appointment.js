// Test script to create an appointment directly
const mongoose = require('mongoose');
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

// Appointment model
const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['chat', 'video', 'in-person'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // in minutes
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

const testAppointment = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to database');

    // Find doctor
    const doctor = await User.findOne({ email: 'dr.johnson@nutrimind.com' });
    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }
    console.log('👨‍⚕️ Doctor found:', doctor._id.toString());

    // Find or create a test patient
    let patient = await User.findOne({ email: 'test@example.com' });
    if (!patient) {
      patient = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      await patient.save();
      console.log('👤 Test patient created:', patient._id.toString());
    } else {
      console.log('👤 Test patient found:', patient._id.toString());
    }

    // Create appointment
    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      type: 'video',
      scheduledAt: new Date('2024-09-30T09:00:00.000Z'),
      duration: 30
    });

    await appointment.save();
    console.log('✅ Appointment created successfully!');
    console.log('Appointment ID:', appointment._id.toString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testAppointment();
