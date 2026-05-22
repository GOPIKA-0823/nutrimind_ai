const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult, param } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const generateToken = (adminId) => {
  return jwt.sign({ userId: adminId, role: 'admin' }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

// Auth routes
router.post('/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return errorResponse;

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ message: 'Admin account is deactivated' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

router.post('/auth/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return errorResponse;

  const { name, email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    admin = new Admin({ name, email, password });
    await admin.save();

    const token = generateToken(admin._id);

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
});

// Protect routes below
router.use(auth, requireAdmin);

router.get('/me', async (req, res) => {
  res.json({ admin: req.user });
});

router.get('/overview', async (req, res) => {
  try {
    const [doctorCount, patientCount, appointmentCount, recentAppointments] = await Promise.all([
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'user' }),
      Appointment.countDocuments({}),
      Appointment.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('doctor', 'name email')
        .populate('patient', 'name email')
    ]);

    res.json({
      summary: {
        doctors: doctorCount,
        patients: patientCount,
        appointments: appointmentCount
      },
      recentAppointments
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ message: 'Server error fetching overview data' });
  }
});

// Doctor management
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({ doctors });
  } catch (error) {
    console.error('Admin fetch doctors error:', error);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
});

router.post('/doctors', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return errorResponse;

  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const doctor = new User({ name, email, password, role: 'doctor', isActive: true });
    await doctor.save();

    res.status(201).json({ message: 'Doctor created successfully', doctor: doctor.toJSON() });
  } catch (error) {
    console.error('Admin create doctor error:', error);
    res.status(500).json({ message: 'Server error creating doctor' });
  }
});

router.patch('/doctors/:id/status', [
  param('id').isMongoId().withMessage('Valid doctor ID is required'),
  body('isActive').isBoolean().withMessage('isActive boolean is required')
], async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return errorResponse;

  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const doctor = await User.findOneAndUpdate(
      { _id: id, role: 'doctor' },
      { isActive },
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor status updated', doctor });
  } catch (error) {
    console.error('Admin update doctor status error:', error);
    res.status(500).json({ message: 'Server error updating doctor status' });
  }
});

router.delete('/doctors/:id', [
  param('id').isMongoId().withMessage('Valid doctor ID is required')
], async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return errorResponse;

  const { id } = req.params;

  try {
    const doctor = await User.findOneAndDelete({ _id: id, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor removed successfully' });
  } catch (error) {
    console.error('Admin remove doctor error:', error);
    res.status(500).json({ message: 'Server error removing doctor' });
  }
});

// Patient management
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'user' }).select('-password');
    res.json({ patients });
  } catch (error) {
    console.error('Admin fetch patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
});

router.post('/patients', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return errorResponse;

  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const patient = new User({ name, email, password, role: 'user', isActive: true });
    await patient.save();

    res.status(201).json({ message: 'Patient created successfully', patient: patient.toJSON() });
  } catch (error) {
    console.error('Admin create patient error:', error);
    res.status(500).json({ message: 'Server error creating patient' });
  }
});

router.delete('/patients/:id', [
  param('id').isMongoId().withMessage('Valid patient ID is required')
], async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return errorResponse;

  const { id } = req.params;

  try {
    const patient = await User.findOneAndDelete({ _id: id, role: 'user' });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient removed successfully' });
  } catch (error) {
    console.error('Admin remove patient error:', error);
    res.status(500).json({ message: 'Server error removing patient' });
  }
});

// Appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .sort({ scheduledAt: -1 })
      .populate('doctor', 'name email')
      .populate('patient', 'name email role');

    res.json({ appointments });
  } catch (error) {
    console.error('Admin fetch appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

module.exports = router;

