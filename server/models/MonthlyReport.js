const mongoose = require('mongoose');

const monthlyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  nutritionSummary: {
    totalCalories: Number,
    averageDailyCalories: Number,
    calorieTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable']
    },
    macronutrients: {
      protein: {
        total: Number,
        average: Number,
        percentage: Number
      },
      carbohydrates: {
        total: Number,
        average: Number,
        percentage: Number
      },
      fat: {
        total: Number,
        average: Number,
        percentage: Number
      }
    },
    micronutrients: {
      deficiencies: [{
        nutrient: String,
        severity: {
          type: String,
          enum: ['low', 'moderate', 'high']
        },
        recommendation: String
      }],
      excesses: [{
        nutrient: String,
        severity: {
          type: String,
          enum: ['low', 'moderate', 'high']
        },
        recommendation: String
      }]
    },
    eatingPatterns: {
      mealTiming: {
        breakfast: Number, // percentage of days
        lunch: Number,
        dinner: Number,
        snacks: Number
      },
      overeatingDays: Number,
      undereatingDays: Number,
      consistentDays: Number
    },
    foodDiversity: {
      score: Number, // 0-100
      uniqueFoods: Number,
      foodGroups: [String]
    }
  },
  moodSummary: {
    averageMood: Number,
    moodTrend: {
      type: String,
      enum: ['improving', 'declining', 'stable']
    },
    moodDistribution: {
      high: Number, // days with mood 8-10
      medium: Number, // days with mood 5-7
      low: Number // days with mood 1-4
    },
    stressPatterns: {
      averageStress: Number,
      highStressDays: Number,
      stressTriggers: [String]
    },
    energyPatterns: {
      averageEnergy: Number,
      lowEnergyDays: Number,
      energyTriggers: [String]
    },
    emotionalInsights: [{
      emotion: String,
      frequency: Number,
      context: String
    }]
  },
  correlations: [{
    factor1: String, // e.g., 'protein_intake'
    factor2: String, // e.g., 'mood_score'
    correlation: Number, // -1 to 1
    significance: Number, // p-value
    insight: String,
    recommendation: String
  }],
  sleepAnalysis: {
    averageSleep: Number,
    sleepQuality: Number,
    sleepConsistency: Number,
    sleepMoodCorrelation: Number
  },
  activityAnalysis: {
    averageSteps: Number,
    exerciseFrequency: Number,
    activityMoodCorrelation: Number,
    fitnessTrend: String
  },
  insights: [{
    type: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'recommendation']
    },
    category: String,
    title: String,
    description: String,
    data: mongoose.Schema.Types.Mixed,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  recommendations: [{
    category: String,
    title: String,
    description: String,
    actionItems: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    timeframe: String
  }],
  redFlags: [{
    type: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    recommendation: String,
    requiresDoctorAttention: Boolean
  }],
  progressMetrics: {
    goalAchievement: Number, // percentage
    habitConsistency: Number,
    improvementAreas: [String],
    strengths: [String]
  },
  narrativeReport: String, // AI-generated human-readable summary
  isReviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
monthlyReportSchema.index({ user: 1, year: -1, month: -1 }, { unique: true });
monthlyReportSchema.index({ generatedAt: -1 });

// Virtual for report status
monthlyReportSchema.virtual('status').get(function() {
  if (this.redFlags.some(flag => flag.severity === 'critical')) {
    return 'critical';
  } else if (this.redFlags.some(flag => flag.severity === 'high')) {
    return 'attention-needed';
  } else if (this.isReviewed) {
    return 'reviewed';
  } else {
    return 'pending-review';
  }
});

module.exports = mongoose.model('MonthlyReport', monthlyReportSchema);
