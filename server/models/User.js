const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'doctor'],
    default: 'user'
  },
  profile: {
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    height: Number, // in cm
    weight: Number, // in kg
    medicalConditions: [String],
    medications: [String],
    allergies: [String],
    fitnessLevel: {
      type: String,
      enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active']
    },
    goals: [String],
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true }
    },
    privacy: {
      shareData: { type: Boolean, default: false },
      anonymousParticipation: { type: Boolean, default: true }
    }
  },
  gamification: {
    points: { type: Number, default: 0 },
    badges: [String],
    streak: { type: Number, default: 1 },
    level: { type: Number, default: 1 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
