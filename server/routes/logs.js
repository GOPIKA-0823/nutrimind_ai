const express = require('express');
const { body, validationResult } = require('express-validator');
const DailyLog = require('../models/DailyLog');
const FoodEntry = require('../models/FoodEntry');
const { auth, requireUser } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/logs
// @desc    Get user's daily logs
// @access  Private
router.get('/', auth, requireUser, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;

    let query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DailyLog.find(query)
      .populate('foodEntries')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    console.log('Retrieved logs count:', logs.length);
    logs.forEach(log => {
      console.log(`Log ${log._id}:`, {
        date: log.date,
        foodEntriesCount: log.foodEntries?.length || 0,
        foodEntries: log.foodEntries?.map(entry => ({
          name: entry.name,
          calories: entry.nutrition?.calories
        })) || []
      });
    });

    // Format logs to match frontend expectations
    const formattedLogs = logs.map(log => {
      const totalCalories = log.foodEntries?.reduce((total, entry) => {
        const calories = entry.nutrition?.calories || 0;
        console.log(`Food entry: ${entry.name}, calories: ${calories}`);
        return total + calories;
      }, 0) || 0;

      console.log('Processing log for formatting:', {
        id: log._id,
        activity: log.activity,
        foodEntries: log.foodEntries?.length || 0,
        totalCalories: totalCalories
      });

      return {
        ...log.toObject(),
        food: {
          entries: log.foodEntries || [],
          totalCalories: totalCalories
        }
      };
    });

    res.json({ logs: formattedLogs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/logs/:date
// @desc    Get specific day's log
// @access  Private
router.get('/:date', auth, requireUser, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const log = await DailyLog.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('foodEntries');

    if (!log) {
      return res.status(404).json({ message: 'Log not found for this date' });
    }

    // Format log to match frontend expectations
    const formattedLog = {
      ...log.toObject(),
      food: {
        entries: log.foodEntries || [],
        totalCalories: log.foodEntries?.reduce((total, entry) => total + (entry.nutrition?.calories || 0), 0) || 0
      }
    };

    res.json({ log: formattedLog });
  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/logs
// @desc    Create or update daily log
// @access  Private
router.post('/', auth, requireUser, [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('mood.score').isInt({ min: 1, max: 10 }).withMessage('Mood score must be between 1-10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, mood, sleep, activity, symptoms, medications, notes, food } = req.body;

    console.log('Received log data:', {
      date,
      mood,
      sleep,
      activity,
      notes
    });

    // Force date to today's server date
    const logDate = new Date();
    const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

    // Check if log already exists
    let log = await DailyLog.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (log) {
      // Update existing log
      Object.assign(log, { mood, sleep, activity, symptoms, medications, notes });
    } else {
      // Create new log
      log = new DailyLog({
        user: req.user._id,
        date: startOfDay,
        mood,
        sleep,
        activity,
        symptoms,
        medications,
        notes
      });
    }

    await log.save();
    await log.populate('foodEntries');

    // Format the response to match frontend expectations
    const formattedLog = {
      ...log.toObject(),
      food: {
        entries: log.foodEntries || [],
        totalCalories: log.foodEntries?.reduce((total, entry) => total + (entry.nutrition?.calories || 0), 0) || 0
      }
    };

    res.json({
      message: 'Log saved successfully',
      log: formattedLog
    });
  } catch (error) {
    console.error('Save log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/logs/:logId/food
// @desc    Add food entry to daily log
// @access  Private
router.post('/:logId/food', auth, requireUser, [
  body('name').notEmpty().withMessage('Food name is required'),
  body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Valid meal type is required'),
  body('nutrition.calories').isNumeric().withMessage('Calories must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const log = await DailyLog.findById(req.params.logId);
    if (!log || log.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Log not found' });
    }

    console.log('Creating food entry with data:', req.body);
    console.log('Nutrition data:', req.body.nutrition);
    console.log('Calories from request:', req.body.nutrition?.calories);

    const foodEntry = new FoodEntry({
      ...req.body,
      dailyLog: log._id,
      user: req.user._id
    });

    console.log('Food entry before save:', {
      name: foodEntry.name,
      nutrition: foodEntry.nutrition,
      calories: foodEntry.nutrition?.calories
    });

    await foodEntry.save();

    console.log('Food entry after save:', {
      name: foodEntry.name,
      nutrition: foodEntry.nutrition,
      calories: foodEntry.nutrition?.calories
    });

    // Add food entry to log
    log.foodEntries.push(foodEntry._id);
    await log.save();

    console.log('Food entry added to log. Log now has food entries:', log.foodEntries.length);
    console.log('Total calories for this log:', log.foodEntries.reduce((total, entry) => total + (entry.nutrition?.calories || 0), 0));

    await foodEntry.populate('dailyLog');

    res.status(201).json({
      message: 'Food entry added successfully',
      foodEntry
    });
  } catch (error) {
    console.error('Add food entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/logs/:logId/food/:foodId
// @desc    Update food entry
// @access  Private
router.put('/:logId/food/:foodId', auth, requireUser, async (req, res) => {
  try {
    const foodEntry = await FoodEntry.findOne({
      _id: req.params.foodId,
      user: req.user._id,
      dailyLog: req.params.logId
    });

    if (!foodEntry) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    Object.assign(foodEntry, req.body);
    await foodEntry.save();

    res.json({
      message: 'Food entry updated successfully',
      foodEntry
    });
  } catch (error) {
    console.error('Update food entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/logs/:logId/food/:foodId
// @desc    Delete food entry
// @access  Private
router.delete('/:logId/food/:foodId', auth, requireUser, async (req, res) => {
  try {
    const foodEntry = await FoodEntry.findOne({
      _id: req.params.foodId,
      user: req.user._id,
      dailyLog: req.params.logId
    });

    if (!foodEntry) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    // Remove from daily log
    const log = await DailyLog.findById(req.params.logId);
    if (log) {
      log.foodEntries = log.foodEntries.filter(
        entry => entry.toString() !== req.params.foodId
      );
      await log.save();
    }

    await FoodEntry.findByIdAndDelete(req.params.foodId);

    res.json({ message: 'Food entry deleted successfully' });
  } catch (error) {
    console.error('Delete food entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/logs/stats/summary
// @desc    Get user's log statistics summary
// @access  Private
router.get('/stats/summary', auth, requireUser, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).populate('foodEntries');

    const stats = {
      totalDays: logs.length,
      averageMood: logs.reduce((sum, log) => sum + (log.mood?.score || 0), 0) / logs.length || 0,
      averageSleep: logs.reduce((sum, log) => sum + (log.sleep?.duration || 0), 0) / logs.length || 0,
      averageSteps: logs.reduce((sum, log) => sum + (log.activity?.steps || 0), 0) / logs.length || 0,
      totalCalories: logs.reduce((sum, log) =>
        sum + log.foodEntries.reduce((foodSum, food) => foodSum + (food.calories || 0), 0), 0),
      moodTrend: logs.slice(-7).map(log => ({
        date: log.date,
        score: log.mood?.score || 0
      })),
      sleepTrend: logs.slice(-7).map(log => ({
        date: log.date,
        duration: log.sleep?.duration || 0
      }))
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
