const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireUser, requireDoctor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, requireUser, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('profile.age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1-120'),
  body('profile.height').optional().isInt({ min: 50, max: 250 }).withMessage('Height must be between 50-250 cm'),
  body('profile.weight').optional().isFloat({ min: 20, max: 300 }).withMessage('Weight must be between 20-300 kg')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user fields
    Object.keys(req.body).forEach(key => {
      if (key === 'profile' && req.body.profile) {
        user.profile = { ...user.profile, ...req.body.profile };
      } else if (key !== 'password' && key !== 'role') {
        user[key] = req.body[key];
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        gamification: user.gamification
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/doctors
// @desc    Get list of available doctors
// @access  Private
router.get('/doctors', auth, requireUser, async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor',
      isActive: true 
    }).select('name email profile');

    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/patients
// @desc    Get list of doctor's patients
// @access  Private (Doctor only)
router.get('/patients', auth, requireDoctor, async (req, res) => {
  try {
    const allPatients = await User.find({ 
      role: 'user',
      'profile.doctorId': req.user._id,
      isActive: true 
    }).select('name email profile gamification');

    // Deduplicate patients by _id
    const uniquePatients = [];
    const seenIds = new Set();
    for (const patient of allPatients) {
      const patientId = patient._id.toString();
      if (!seenIds.has(patientId)) {
        seenIds.add(patientId);
        uniquePatients.push(patient);
      }
    }

    res.json({ patients: uniquePatients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/assign-doctor
// @desc    Assign doctor to patient
// @access  Private
router.post('/assign-doctor', auth, requireUser, [
  body('doctorId').optional().isMongoId().withMessage('Valid doctor ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctorId } = req.body;

    // Update user's doctor assignment
    const user = await User.findById(req.user._id);
    
    if (doctorId === null || doctorId === undefined) {
      // Remove doctor assignment
      user.profile.doctorId = undefined;
      await user.save();
      return res.json({
        message: 'Doctor removed successfully',
        doctor: null
      });
    }

    // Verify doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    user.profile.doctorId = doctorId;
    await user.save();

    res.json({
      message: 'Doctor assigned successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email
      }
    });
  } catch (error) {
    console.error('Assign doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/all
// @desc    Get all users (for doctors)
// @access  Private (Doctor only)
router.get('/all', auth, requireDoctor, async (req, res) => {
  try {
    const users = await User.find({ 
      role: 'user',
      isActive: true 
    }).select('name email profile gamification');

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/assign-patient
// @desc    Assign patient to doctor
// @access  Private (Doctor only)
router.post('/assign-patient', auth, requireDoctor, [
  body('userId').isMongoId().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    // Verify user exists and is a user (not doctor)
    const patient = await User.findById(userId);
    if (!patient || patient.role !== 'user') {
      return res.status(400).json({ message: 'Invalid user' });
    }

    // Update user's doctor assignment
    patient.profile.doctorId = req.user._id;
    await patient.save();

    res.json({
      message: 'Patient assigned successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Assign patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/remove-patient
// @desc    Remove patient from doctor
// @access  Private (Doctor only)
router.post('/remove-patient', auth, requireDoctor, [
  body('userId').isMongoId().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    // Verify user exists
    const patient = await User.findById(userId);
    if (!patient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify this patient is assigned to this doctor
    if (patient.profile.doctorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This patient is not assigned to you' });
    }

    // Remove doctor assignment
    patient.profile.doctorId = undefined;
    await patient.save();

    res.json({
      message: 'Patient removed successfully'
    });
  } catch (error) {
    console.error('Remove patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const stats = {
      profile: {
        completion: calculateProfileCompletion(user.profile),
        lastUpdated: user.updatedAt
      },
      gamification: user.gamification,
      account: {
        memberSince: user.createdAt,
        lastActive: user.updatedAt
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (req.body.notifications) {
      user.preferences.notifications = { ...user.preferences.notifications, ...req.body.notifications };
    }
    
    if (req.body.privacy) {
      user.preferences.privacy = { ...user.preferences.privacy, ...req.body.privacy };
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, requireUser, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate profile completion
function calculateProfileCompletion(profile) {
  const fields = ['age', 'gender', 'height', 'weight', 'fitnessLevel'];
  const completedFields = fields.filter(field => profile[field] !== undefined && profile[field] !== null);
  return Math.round((completedFields.length / fields.length) * 100);
}

module.exports = router;
