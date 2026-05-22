const mongoose = require('mongoose');

const doctorSuggestionSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonthlyReport',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  suggestions: [{
    category: {
      type: String,
      enum: ['nutrition', 'mood', 'sleep', 'activity', 'lifestyle', 'medical'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    timeframe: {
      type: String,
      enum: ['immediate', '1-week', '2-weeks', '1-month', '3-months', 'ongoing'],
      default: '1-month'
    },
    actionItems: [{
      task: String,
      completed: { type: Boolean, default: false },
      completedAt: Date,
      notes: String
    }],
    resources: [{
      type: {
        type: String,
        enum: ['article', 'video', 'app', 'book', 'website', 'exercise']
      },
      title: String,
      url: String,
      description: String
    }]
  }],
  goals: [{
    category: String,
    title: String,
    description: String,
    target: mongoose.Schema.Types.Mixed, // can be number, string, or object
    currentValue: mongoose.Schema.Types.Mixed,
    unit: String,
    deadline: Date,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    milestones: [{
      description: String,
      targetValue: mongoose.Schema.Types.Mixed,
      achieved: { type: Boolean, default: false },
      achievedAt: Date
    }]
  }],
  followUp: {
    required: Boolean,
    scheduledDate: Date,
    type: {
      type: String,
      enum: ['chat', 'video', 'in-person']
    },
    notes: String
  },
  medicationChanges: [{
    action: {
      type: String,
      enum: ['start', 'stop', 'adjust', 'continue']
    },
    medication: String,
    dosage: String,
    instructions: String,
    startDate: Date,
    endDate: Date,
    notes: String
  }],
  lifestyleRecommendations: [{
    category: String,
    recommendation: String,
    rationale: String,
    implementation: String,
    expectedOutcome: String
  }],
  concerns: [{
    type: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    action: String,
    followUpRequired: Boolean
  }],
  encouragement: {
    message: String,
    achievements: [String],
    strengths: [String]
  },
  nextSteps: [String],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    helpful: Boolean,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
doctorSuggestionSchema.index({ patient: 1, createdAt: -1 });
doctorSuggestionSchema.index({ doctor: 1, createdAt: -1 });
doctorSuggestionSchema.index({ report: 1 });

// Virtual for completion status
doctorSuggestionSchema.virtual('completionStatus').get(function() {
  const totalActionItems = this.suggestions.reduce((total, suggestion) => 
    total + suggestion.actionItems.length, 0);
  const completedActionItems = this.suggestions.reduce((total, suggestion) => 
    total + suggestion.actionItems.filter(item => item.completed).length, 0);
  
  return totalActionItems > 0 ? (completedActionItems / totalActionItems) * 100 : 0;
});

module.exports = mongoose.model('DoctorSuggestion', doctorSuggestionSchema);
