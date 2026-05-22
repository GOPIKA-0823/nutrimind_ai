const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MonthlyReport = require('../models/MonthlyReport');
const DailyLog = require('../models/DailyLog');
const FoodEntry = require('../models/FoodEntry');
const { auth, requireDoctor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/doctors/stats
// @desc    Get doctor dashboard statistics
// @access  Private (Doctor only)
router.get('/stats', auth, requireDoctor, async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get total patients assigned to this doctor
    const totalPatients = await User.countDocuments({
      role: 'user',
      'profile.doctorId': doctorId,
      isActive: true
    });

    // Get pending reports (reports not reviewed by any doctor)
    const patientIds = await User.find({ 'profile.doctorId': doctorId }).distinct('_id');
    const pendingReports = await MonthlyReport.countDocuments({
      $or: [
        { reviewedBy: { $exists: false } },
        { reviewedBy: null }
      ],
      user: { $in: patientIds }
    });

    // Get monthly consultations (appointments this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyConsultations = await Appointment.countDocuments({
      doctor: doctorId,
      scheduledAt: { $gte: startOfMonth }
    });

    // Calculate average patient score from recent reports
    // Reuse patientIds from above
    const recentReports = await MonthlyReport.find({
      user: { $in: patientIds }
    })
      .sort({ year: -1, month: -1 })
      .limit(100);

    let avgPatientScore = 0;
    if (recentReports.length > 0) {
      const totalScore = recentReports.reduce((sum, report) => {
        return sum + (report.overallScore || 0);
      }, 0);
      avgPatientScore = totalScore / recentReports.length;
    }

    res.json({
      totalPatients,
      pendingReports,
      monthlyConsultations,
      avgPatientScore: Math.round(avgPatientScore * 10) / 10
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/recent-patients
// @desc    Get doctor's recent patients with their latest report info
// @access  Private (Doctor only)
router.get('/recent-patients', auth, requireDoctor, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get patients assigned to this doctor (deduplicate by _id)
    const patients = await User.find({
      role: 'user',
      'profile.doctorId': doctorId,
      isActive: true
    })
      .select('name email profile gamification')
      .sort({ createdAt: -1 });

    // Deduplicate patients by _id
    const uniquePatients = [];
    const seenIds = new Set();
    for (const patient of patients) {
      const patientId = patient._id.toString();
      if (!seenIds.has(patientId)) {
        seenIds.add(patientId);
        uniquePatients.push(patient);
      }
    }
    const limitedPatients = uniquePatients.slice(0, limit);

    // Get latest report for each patient
    const patientsWithReports = await Promise.all(
      limitedPatients.map(async (patient) => {
        const latestReport = await MonthlyReport.findOne({ user: patient._id })
          .sort({ year: -1, month: -1 })
          .select('year month overallScore reviewedBy');

        const lastReportDate = latestReport
          ? `${latestReport.year}-${String(latestReport.month).padStart(2, '0')}-01`
          : null;

        const score = latestReport?.overallScore || patient.gamification?.score || 0;
        const status = latestReport?.reviewedBy ? 'active' : 'pending';

        return {
          id: patient._id,
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          lastReport: lastReportDate,
          score: Math.round(score * 10) / 10,
          status
        };
      })
    );

    res.json({ patients: patientsWithReports });
  } catch (error) {
    console.error('Get recent patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/upcoming-consultations
// @desc    Get doctor's upcoming consultations
// @access  Private (Doctor only)
router.get('/upcoming-consultations', auth, requireDoctor, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const now = new Date();
    const appointments = await Appointment.find({
      doctor: doctorId,
      scheduledAt: { $gte: now },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('patient', 'name email')
      .sort({ scheduledAt: 1 });

    // Deduplicate consultations by appointment _id
    const uniqueAppointments = [];
    const seenAppointmentIds = new Set();
    for (const apt of appointments) {
      const aptId = apt._id.toString();
      if (!seenAppointmentIds.has(aptId)) {
        seenAppointmentIds.add(aptId);
        uniqueAppointments.push(apt);
      }
    }
    const limitedAppointments = uniqueAppointments.slice(0, limit);

    const consultations = limitedAppointments.map((apt) => ({
      id: apt._id,
      patient: apt.patient?.name || 'Unknown Patient',
      patientId: apt.patient?._id,
      date: apt.scheduledAt.toISOString().split('T')[0],
      time: apt.scheduledAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      type: apt.type === 'video' ? 'Video Call' : 'Phone Call',
      appointmentId: apt._id
    }));

    res.json({ consultations });
  } catch (error) {
    console.error('Get upcoming consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/reports
// @desc    Get all reports for doctor's assigned patients
// @access  Private (Doctor only)
router.get('/reports', auth, requireDoctor, async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get all patient IDs assigned to this doctor
    const patients = await User.find({
      role: 'user',
      'profile.doctorId': doctorId,
      isActive: true
    }).select('_id name email');

    // Deduplicate patients by _id
    const uniquePatients = [];
    const seenIds = new Set();
    for (const patient of patients) {
      const patientId = patient._id.toString();
      if (!seenIds.has(patientId)) {
        seenIds.add(patientId);
        uniquePatients.push(patient);
      }
    }

    const patientIds = uniquePatients.map(p => p._id);

    // Get all reports for these patients
    const reports = await MonthlyReport.find({
      user: { $in: patientIds }
    })
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ year: -1, month: -1 });

    // Format reports for frontend
    const formattedReports = reports.map((report) => {
      const patient = report.user;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[report.month - 1] || `Month ${report.month}`;
      const monthDisplay = `${monthName} ${report.year}`;

      // Calculate scores from report data
      const moodScore = report.insights?.mood?.average || report.moodSummary?.averageMood || 0;
      const sleepQuality = report.sleepAnalysis?.averageSleep || report.sleepAnalysis?.sleepQuality || 0;
      const activityLevel = report.insights?.activity?.average || 0;

      // Get nutrition score (convert to letter grade if needed)
      const nutritionScore = report.nutritionSummary?.averageDailyCalories
        ? (report.nutritionSummary.averageDailyCalories > 2000 ? 'A' :
          report.nutritionSummary.averageDailyCalories > 1800 ? 'B' :
            report.nutritionSummary.averageDailyCalories > 1500 ? 'C' : 'D')
        : 'N/A';

      return {
        id: report._id.toString(),
        _id: report._id.toString(),
        patientName: patient?.name || 'Unknown Patient',
        patientEmail: patient?.email || '',
        patientId: patient?._id?.toString() || '',
        month: monthDisplay,
        year: report.year,
        monthNumber: report.month,
        status: report.reviewedBy ? 'reviewed' : 'pending',
        moodScore: Math.round(moodScore * 10) / 10,
        sleepQuality: Math.round(sleepQuality * 10) / 10,
        activityLevel: Math.round(activityLevel * 10) / 10,
        nutritionScore: nutritionScore,
        overallScore: report.overallScore || 0,
        generatedDate: report.createdAt ? new Date(report.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        lastReviewed: report.reviewedAt ? new Date(report.reviewedAt).toISOString().split('T')[0] : null,
        reviewedBy: report.reviewedBy?.name || null,
        reportData: report // Include full report data for PDF generation
      };
    });

    res.json({ reports: formattedReports });
  } catch (error) {
    console.error('Get doctor reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/patients/:patientId
// @desc    Get detailed patient information
// @access  Private (Doctor only)
router.get('/patients/:patientId', auth, requireDoctor, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.patientId;

    // Verify patient is assigned to this doctor
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    if (patient.profile?.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ message: 'Access denied. This patient is not assigned to you.' });
    }

    // Get patient details
    const patientDetails = {
      id: patient._id,
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      profile: {
        age: patient.profile?.age,
        gender: patient.profile?.gender,
        height: patient.profile?.height,
        weight: patient.profile?.weight,
        medicalConditions: patient.profile?.medicalConditions || [],
        medications: patient.profile?.medications || [],
        allergies: patient.profile?.allergies || [],
        fitnessLevel: patient.profile?.fitnessLevel,
        goals: patient.profile?.goals || []
      },
      gamification: patient.gamification || {},
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    };

    res.json({ patient: patientDetails });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/patients/:patientId/logs
// @desc    Get patient's daily logs
// @access  Private (Doctor only)
router.get('/patients/:patientId/logs', auth, requireDoctor, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.patientId;
    const { startDate, endDate, limit = 30 } = req.query;

    // Verify patient is assigned to this doctor
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    if (patient.profile?.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ message: 'Access denied. This patient is not assigned to you.' });
    }

    // Build query
    let query = { user: patientId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get daily logs
    const logs = await DailyLog.find(query)
      .populate('foodEntries')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Format logs to match frontend expectations
    const formattedLogs = logs.map(log => {
      const totalCalories = log.foodEntries?.reduce((total, entry) => {
        const calories = entry.nutrition?.calories || entry.calories || 0;
        return total + calories;
      }, 0) || 0;

      return {
        _id: log._id,
        id: log._id,
        userId: log.user.toString(),
        date: log.date,
        mood: {
          score: log.mood?.score || 0,
          notes: log.mood?.notes || '',
          emotions: log.mood?.emotions || [],
          stressLevel: log.mood?.stressLevel,
          energyLevel: log.mood?.energyLevel
        },
        sleep: {
          duration: log.sleep?.duration || 0,
          quality: log.sleep?.quality || 0,
          bedtime: log.sleep?.bedtime,
          wakeTime: log.sleep?.wakeTime,
          notes: log.sleep?.notes || ''
        },
        activity: {
          steps: log.activity?.steps || 0,
          exerciseCount: log.activity?.exercise?.length || 0,
          exercise: log.activity?.exercise || [],
          waterIntake: log.activity?.waterIntake || 0,
          notes: log.activity?.notes || ''
        },
        food: {
          entries: log.foodEntries || [],
          totalCalories: totalCalories
        },
        symptoms: log.symptoms || [],
        medications: log.medications || [],
        notes: log.notes || '',
        isComplete: log.isComplete || false,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt
      };
    });

    res.json({ logs: formattedLogs });
  } catch (error) {
    console.error('Get patient logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

