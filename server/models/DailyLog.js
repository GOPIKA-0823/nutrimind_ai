const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  foodEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodEntry'
  }],
  mood: {
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    notes: String,
    emotions: [String], // e.g., ['happy', 'stressed', 'energetic']
    stressLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  sleep: {
    duration: Number, // in hours
    quality: {
      type: Number,
      min: 1,
      max: 10
    },
    bedtime: Date,
    wakeTime: Date,
    notes: String
  },
  activity: {
    steps: Number,
    exercise: [{
      type: String, // e.g., 'walking', 'running', 'yoga'
      duration: Number, // in minutes
      intensity: {
        type: String,
        enum: ['low', 'moderate', 'high']
      }
    }],
    waterIntake: Number, // in ml
    notes: String
  },
  symptoms: [{
    type: String,
    severity: {
      type: Number,
      min: 1,
      max: 10
    },
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    time: Date,
    notes: String
  }],
  notes: String,
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual for total calories
dailyLogSchema.virtual('totalCalories').get(function () {
  return this.foodEntries.reduce((total, entry) => total + (entry.calories || 0), 0);
});

// Virtual for mood trend (compared to previous day)
dailyLogSchema.virtual('moodTrend').get(function () {
  // This would be calculated in the service layer
  return null;
});

module.exports = mongoose.model('DailyLog', dailyLogSchema);
