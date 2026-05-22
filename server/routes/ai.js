const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { auth, requireUser } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/ai/analyze-food
// @desc    Analyze food from image
// @access  Private
router.post('/analyze-food', auth, requireUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // In a real implementation, this would call an AI service
    // For now, we'll return mock data
    const mockAnalysis = {
      detectedFoods: [
        {
          name: 'Grilled Chicken Breast',
          confidence: 0.95,
          nutrition: {
            calories: 231,
            protein: 43.5,
            carbohydrates: 0,
            fat: 5.0,
            fiber: 0,
            sugar: 0,
            sodium: 74
          },
          serving: {
            size: 100,
            unit: 'grams'
          }
        },
        {
          name: 'Steamed Broccoli',
          confidence: 0.88,
          nutrition: {
            calories: 34,
            protein: 2.8,
            carbohydrates: 6.6,
            fat: 0.4,
            fiber: 2.6,
            sugar: 1.5,
            sodium: 33
          },
          serving: {
            size: 100,
            unit: 'grams'
          }
        }
      ],
      totalNutrition: {
        calories: 265,
        protein: 46.3,
        carbohydrates: 6.6,
        fat: 5.4,
        fiber: 2.6,
        sugar: 1.5,
        sodium: 107
      },
      suggestions: [
        'Consider adding a complex carbohydrate like brown rice for balanced nutrition',
        'Great protein choice! Chicken breast is lean and nutritious'
      ]
    };

    res.json({
      message: 'Food analysis completed',
      analysis: mockAnalysis
    });
  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({ message: 'Server error during food analysis' });
  }
});

// @route   POST /api/ai/analyze-mood-correlation
// @desc    Analyze mood and food correlations
// @access  Private
router.post('/analyze-mood-correlation', auth, requireUser, async (req, res) => {
  try {
    const { days = 30 } = req.body;

    // In a real implementation, this would analyze actual user data
    // For now, we'll return mock correlation analysis
    const mockCorrelations = {
      correlations: [
        {
          factor1: 'protein_intake',
          factor2: 'mood_score',
          correlation: 0.65,
          significance: 0.02,
          insight: 'Higher protein intake is associated with better mood scores',
          recommendation: 'Consider increasing protein intake, especially in the morning'
        },
        {
          factor1: 'sugar_intake',
          factor2: 'mood_score',
          correlation: -0.45,
          significance: 0.05,
          insight: 'High sugar intake may lead to mood crashes later in the day',
          recommendation: 'Reduce refined sugar intake and opt for complex carbohydrates'
        },
        {
          factor1: 'sleep_duration',
          factor2: 'mood_score',
          correlation: 0.72,
          significance: 0.01,
          insight: 'Adequate sleep is strongly correlated with better mood',
          recommendation: 'Aim for 7-9 hours of sleep per night for optimal mood'
        }
      ],
      insights: [
        {
          type: 'positive',
          category: 'nutrition',
          title: 'Protein-Mood Connection',
          description: 'Your mood tends to be better on days when you consume adequate protein.',
          data: { correlation: 0.65, days_analyzed: days }
        },
        {
          type: 'recommendation',
          category: 'sleep',
          title: 'Sleep Optimization',
          description: 'Improving your sleep duration could significantly boost your mood.',
          data: { correlation: 0.72, current_avg: 6.5, recommended: 8 }
        }
      ],
      recommendations: [
        {
          category: 'nutrition',
          title: 'Increase Morning Protein',
          description: 'Start your day with a protein-rich breakfast to support stable mood throughout the day.',
          actionItems: [
            'Include eggs, Greek yogurt, or protein smoothie in breakfast',
            'Aim for 20-30g protein in the morning'
          ],
          priority: 'high',
          timeframe: '1-week'
        },
        {
          category: 'sleep',
          title: 'Improve Sleep Hygiene',
          description: 'Better sleep quality will have a positive impact on your daily mood.',
          actionItems: [
            'Maintain consistent bedtime routine',
            'Avoid screens 1 hour before bed',
            'Keep bedroom cool and dark'
          ],
          priority: 'medium',
          timeframe: '2-weeks'
        }
      ]
    };

    res.json({
      message: 'Mood correlation analysis completed',
      analysis: mockCorrelations
    });
  } catch (error) {
    console.error('Mood correlation analysis error:', error);
    res.status(500).json({ message: 'Server error during correlation analysis' });
  }
});

// @route   POST /api/ai/generate-insights
// @desc    Generate personalized insights
// @access  Private
router.post('/generate-insights', auth, requireUser, async (req, res) => {
  try {
    const { category, timeframe = 'week' } = req.body;

    // Mock AI-generated insights
    const mockInsights = {
      nutrition: {
        insights: [
          {
            type: 'positive',
            title: 'Great Hydration Habits',
            description: 'You\'ve been consistently meeting your water intake goals this week!',
            impact: 'high',
            data: { days_met: 6, target: 8 }
          },
          {
            type: 'recommendation',
            title: 'Fiber Intake Optimization',
            description: 'Consider adding more fiber-rich foods to support digestive health.',
            impact: 'medium',
            data: { current_avg: 18, recommended: 25 }
          }
        ],
        recommendations: [
          'Add berries to your morning routine for natural fiber',
          'Include leafy greens in at least one meal daily'
        ]
      },
      mood: {
        insights: [
          {
            type: 'positive',
            title: 'Stable Mood Pattern',
            description: 'Your mood has been consistently positive this week.',
            impact: 'high',
            data: { avg_mood: 7.8, trend: 'stable' }
          }
        ],
        recommendations: [
          'Continue your current stress management practices',
          'Consider journaling to maintain emotional awareness'
        ]
      },
      activity: {
        insights: [
          {
            type: 'recommendation',
            title: 'Activity Consistency',
            description: 'Try to maintain more consistent daily activity levels.',
            impact: 'medium',
            data: { active_days: 4, target: 7 }
          }
        ],
        recommendations: [
          'Take a 10-minute walk during lunch breaks',
          'Set a daily step goal of 8,000 steps'
        ]
      }
    };

    const selectedInsights = category ? mockInsights[category] : mockInsights;

    res.json({
      message: 'Insights generated successfully',
      insights: selectedInsights,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({ message: 'Server error during insight generation' });
  }
});

// @route   POST /api/ai/chat
// @desc    AI chat assistant - medical content only from chatbot.py
// @access  Private
router.post('/chat', auth, requireUser, [
  body('message').notEmpty().withMessage('Message is required'),
  body('context').optional().isObject().withMessage('Context must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;

    const { spawn } = require('child_process');
    const path = require('path');

    // Run Python chatbot - medical model only
    const runPythonChatbot = (msg) => {
      return new Promise((resolve, reject) => {
        const pythonExe = 'C:\\Users\\gobik\\AppData\\Local\\Programs\\Python\\Python314\\python.exe';
        const pythonProcess = spawn(pythonExe, [
          path.join(__dirname, '../../chatbot/chatbot.py'),
          msg
        ]);

        let result = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error(`Python script exited with code ${code}: ${errorData}`);
            const error = new Error('Python script failed');
            error.stderr = errorData;
            reject(error);
          } else {
            resolve(result.trim());
          }
        });
      });
    };

    try {
      const pythonResponse = await runPythonChatbot(message);
      if (pythonResponse) {
        return res.json({
          message: 'AI response generated',
          response: {
            text: pythonResponse,
            suggestions: ['Tell me more', 'What should I do?'],
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (err) {
      console.error('Medical chatbot failed:', err.message, err.stderr || '');
    }

    // Professional fallback
    return res.status(503).json({
      message: 'Medical assistant temporarily unavailable',
      response: {
        text: 'The medical assistant is temporarily unavailable. Please describe your symptoms (e.g., headache, chest pain, dizziness) and ensure the system is properly configured. If the problem persists, please contact support.',
        suggestions: ['Try again', 'Check setup'],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Server error during AI chat' });
  }
});

module.exports = router;
