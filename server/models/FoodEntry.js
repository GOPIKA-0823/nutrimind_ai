const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
  dailyLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyLog',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: String,
  aiDetected: {
    type: Boolean,
    default: false
  },
  confidence: Number, // AI confidence score (0-1)
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  nutrition: {
    calories: {
      type: Number,
      required: true
    },
    protein: Number, // in grams
    carbohydrates: Number, // in grams
    fat: Number, // in grams
    fiber: Number, // in grams
    sugar: Number, // in grams
    sodium: Number, // in mg
    cholesterol: Number, // in mg
    vitamins: {
      vitaminA: Number, // in IU
      vitaminC: Number, // in mg
      vitaminD: Number, // in IU
      vitaminE: Number, // in mg
      vitaminK: Number, // in mcg
      thiamine: Number, // in mg
      riboflavin: Number, // in mg
      niacin: Number, // in mg
      vitaminB6: Number, // in mg
      folate: Number, // in mcg
      vitaminB12: Number, // in mcg
      biotin: Number, // in mcg
      pantothenicAcid: Number // in mg
    },
    minerals: {
      calcium: Number, // in mg
      iron: Number, // in mg
      magnesium: Number, // in mg
      phosphorus: Number, // in mg
      potassium: Number, // in mg
      zinc: Number, // in mg
      copper: Number, // in mg
      manganese: Number, // in mg
      selenium: Number // in mcg
    }
  },
  serving: {
    size: Number,
    unit: String, // e.g., 'cup', 'piece', 'gram'
    quantity: Number
  },
  ingredients: [String],
  allergens: [String],
  tags: [String], // e.g., ['organic', 'gluten-free', 'vegan']
  moodBefore: {
    type: Number,
    min: 1,
    max: 10
  },
  moodAfter: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
foodEntrySchema.index({ user: 1, timestamp: -1 });
foodEntrySchema.index({ dailyLog: 1 });

// Virtual for nutrition score
foodEntrySchema.virtual('nutritionScore').get(function() {
  const nutrition = this.nutrition;
  if (!nutrition) return 0;
  
  let score = 0;
  let factors = 0;
  
  // Protein score (0-25 points)
  if (nutrition.protein) {
    score += Math.min(25, nutrition.protein * 2);
    factors++;
  }
  
  // Fiber score (0-25 points)
  if (nutrition.fiber) {
    score += Math.min(25, nutrition.fiber * 5);
    factors++;
  }
  
  // Vitamin diversity (0-25 points)
  const vitaminCount = Object.values(nutrition.vitamins || {}).filter(v => v > 0).length;
  score += Math.min(25, vitaminCount * 2);
  factors++;
  
  // Mineral diversity (0-25 points)
  const mineralCount = Object.values(nutrition.minerals || {}).filter(m => m > 0).length;
  score += Math.min(25, mineralCount * 2);
  factors++;
  
  return factors > 0 ? Math.round(score / factors) : 0;
});

module.exports = mongoose.model('FoodEntry', foodEntrySchema);
