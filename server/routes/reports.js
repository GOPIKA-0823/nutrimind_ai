const express = require('express');
const MonthlyReport = require('../models/MonthlyReport');
const DoctorSuggestion = require('../models/DoctorSuggestion');
const DailyLog = require('../models/DailyLog');
const { auth, requireUser, requireDoctor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get user's monthly reports
// @access  Private
router.get('/', auth, requireUser, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let query = { user: req.user._id };
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);

    const reports = await MonthlyReport.find(query)
      .populate('reviewedBy', 'name email')
      .sort({ year: -1, month: -1 });

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/:reportId
// @desc    Get specific monthly report
// @access  Private
router.get('/:reportId', auth, requireUser, async (req, res) => {
  try {
    const report = await MonthlyReport.findById(req.params.reportId)
      .populate('reviewedBy', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user has access to this report
    if (report.user.toString() !== req.user._id.toString() && req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get doctor suggestions for this report
    const suggestions = await DoctorSuggestion.findOne({ report: report._id })
      .populate('doctor', 'name email');

    res.json({ 
      report,
      suggestions: suggestions || null
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reports/generate
// @desc    Generate monthly report for user
// @access  Private
router.post('/generate', auth, requireUser, async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    // Check if report already exists
    const existingReport = await MonthlyReport.findOne({
      user: req.user._id,
      year: parseInt(year),
      month: parseInt(month)
    });

    if (existingReport) {
      return res.status(400).json({ message: 'Report already exists for this month' });
    }

    // Get daily logs for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('foodEntries');

    if (logs.length === 0) {
      return res.status(400).json({ message: 'No data available for this month' });
    }

    // Generate AI report (simplified version - in real app, this would call AI service)
    const report = await generateMonthlyReport(req.user._id, year, month, logs);

    res.status(201).json({
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reports/:reportId/suggestions
// @desc    Add doctor suggestions to report
// @access  Private (Doctor only)
router.post('/:reportId/suggestions', auth, requireDoctor, async (req, res) => {
  try {
    const report = await MonthlyReport.findById(req.params.reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if suggestions already exist
    const existingSuggestions = await DoctorSuggestion.findOne({ report: report._id });
    
    if (existingSuggestions) {
      return res.status(400).json({ message: 'Suggestions already exist for this report' });
    }

    const suggestions = new DoctorSuggestion({
      report: report._id,
      doctor: req.user._id,
      patient: report.user,
      ...req.body
    });

    await suggestions.save();

    // Mark report as reviewed
    report.isReviewed = true;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    await suggestions.populate('doctor', 'name email');

    res.status(201).json({
      message: 'Suggestions added successfully',
      suggestions
    });
  } catch (error) {
    console.error('Add suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reports/:reportId/suggestions
// @desc    Update doctor suggestions
// @access  Private (Doctor only)
router.put('/:reportId/suggestions', auth, requireDoctor, async (req, res) => {
  try {
    const suggestions = await DoctorSuggestion.findOne({ 
      report: req.params.reportId,
      doctor: req.user._id
    });

    if (!suggestions) {
      return res.status(404).json({ message: 'Suggestions not found' });
    }

    Object.assign(suggestions, req.body);
    await suggestions.save();

    res.json({
      message: 'Suggestions updated successfully',
      suggestions
    });
  } catch (error) {
    console.error('Update suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reports/:reportId/feedback
// @desc    Add patient feedback to suggestions
// @access  Private
router.post('/:reportId/feedback', auth, requireUser, async (req, res) => {
  try {
    const suggestions = await DoctorSuggestion.findOne({ 
      report: req.params.reportId,
      patient: req.user._id
    });

    if (!suggestions) {
      return res.status(404).json({ message: 'Suggestions not found' });
    }

    suggestions.patientFeedback = {
      ...req.body,
      submittedAt: new Date()
    };

    await suggestions.save();

    res.json({
      message: 'Feedback submitted successfully',
      suggestions
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate monthly report
async function generateMonthlyReport(userId, year, month, logs) {
  // Calculate nutrition summary
  const totalCalories = logs.reduce((sum, log) => 
    sum + log.foodEntries.reduce((foodSum, food) => foodSum + (food.calories || 0), 0), 0);
  
  const averageDailyCalories = totalCalories / logs.length;
  
  // Calculate mood summary
  const moodScores = logs.map(log => log.mood?.score || 0).filter(score => score > 0);
  const averageMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length || 0;
  
  // Calculate sleep summary
  const sleepDurations = logs.map(log => log.sleep?.duration || 0).filter(duration => duration > 0);
  const averageSleep = sleepDurations.reduce((sum, duration) => sum + duration, 0) / sleepDurations.length || 0;
  
  // Generate insights
  const insights = [];
  
  if (averageMood < 5) {
    insights.push({
      type: 'negative',
      category: 'mood',
      title: 'Low Mood Trend',
      description: 'Your average mood this month was below optimal levels.',
      priority: 'high'
    });
  }
  
  if (averageSleep < 7) {
    insights.push({
      type: 'recommendation',
      category: 'sleep',
      title: 'Sleep Optimization',
      description: 'Consider improving your sleep duration for better health.',
      priority: 'medium'
    });
  }
  
  // Create report
  const report = new MonthlyReport({
    user: userId,
    year,
    month,
    nutritionSummary: {
      totalCalories,
      averageDailyCalories,
      calorieTrend: 'stable' // Simplified
    },
    moodSummary: {
      averageMood,
      moodTrend: 'stable' // Simplified
    },
    sleepAnalysis: {
      averageSleep,
      sleepQuality: 7, // Simplified
      sleepConsistency: 80 // Simplified
    },
    insights,
    narrativeReport: `Your monthly report shows an average mood of ${averageMood.toFixed(1)}/10 and ${averageSleep.toFixed(1)} hours of sleep per night. ${insights.length > 0 ? 'Consider the recommendations below for improvement.' : 'Great job maintaining healthy habits!'}`
  });

  await report.save();
  return report;
}

module.exports = router;
