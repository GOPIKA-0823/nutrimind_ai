const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { auth, requireUser, requireDoctor } = require('../middleware/auth');

const router = express.Router();

const createMeetingLink = () => `https://meet.nutrimind.ai/session/${crypto.randomUUID()}`;
const getDefaultLocation = (doctor) => {
  if (doctor?.profile?.clinic?.name || doctor?.profile?.clinic?.address) {
    const clinicName = doctor.profile.clinic.name || 'Clinic';
    const clinicAddress = doctor.profile.clinic.address || '';
    return `${clinicName}${clinicAddress ? ` • ${clinicAddress}` : ''}`;
  }
  return 'NutriMind Wellness Center';
};

// @route   GET /api/appointments
// @desc    Get user's appointments
// @access  Private
router.get('/', auth, requireUser, async (req, res) => {
  try {
    const { status, type, upcoming } = req.query;

    let query = {};

    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else {
      query.patient = req.user._id;
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email profile')
      .populate('doctor', 'name email profile')
      .sort({ scheduledAt: -1 });

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/:appointmentId
// @desc    Get specific appointment
// @access  Private
router.get('/:appointmentId', auth, requireUser, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patient', 'name email profile')
      .populate('doctor', 'name email profile');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    const hasAccess = req.user.role === 'doctor'
      ? appointment.doctor._id.toString() === req.user._id.toString()
      : appointment.patient._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', auth, requireUser, [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('doctor').isMongoId().withMessage('Valid doctor ID is required'),
  body('type').isIn(['video', 'phone']).withMessage('Valid appointment type is required'),
  body('scheduledAt').isISO8601().withMessage('Valid scheduled date is required')
], async (req, res) => {
  try {
    console.log('Appointment creation request:', req.body);
    console.log('User making request:', req.user);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { patient, doctor, type, scheduledAt, duration, agenda, notes, billing, transactionId, location: locationFromRequest, meetingLink: meetingLinkFromRequest } = req.body;

    // Verify doctor exists and is a doctor
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    // Verify patient exists
    const patientUser = await User.findById(patient);
    if (!patientUser) {
      return res.status(400).json({ message: 'Invalid patient' });
    }

    // Check if user can create this appointment
    if (req.user.role === 'user' && req.user._id.toString() !== patient) {
      return res.status(403).json({ message: 'You can only create appointments for yourself' });
    }

    // Check for scheduling conflicts
    const conflict = await Appointment.findOne({
      $or: [
        { doctor, scheduledAt: { $gte: new Date(scheduledAt), $lt: new Date(new Date(scheduledAt).getTime() + (duration || 30) * 60000) } },
        { patient, scheduledAt: { $gte: new Date(scheduledAt), $lt: new Date(new Date(scheduledAt).getTime() + (duration || 30) * 60000) } }
      ],
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Scheduling conflict detected' });
    }

    // Calculate consultation fee based on type
    let consultationFee = 150; // Default (online/video)
    if (type === 'phone') {
      consultationFee = 100;
    }

    // Use provided billing info or create default
    const billingInfo = billing || {
      amount: consultationFee,
      currency: 'USD',
      status: 'pending',
      paymentMethod: null,
      paidAt: null
    };

    // If payment is provided, mark as paid
    if (billing && billing.status === 'paid') {
      billingInfo.status = 'paid';
      billingInfo.paidAt = new Date();
    }

    const appointmentDuration = duration || 30;
    const appointmentDate = new Date(scheduledAt);

    const appointmentData = {
      patient,
      doctor,
      type,
      scheduledAt: appointmentDate,
      duration: appointmentDuration,
      agenda: Array.isArray(agenda) && agenda.length ? agenda : ['General consultation'],
      notes,
      billing: billingInfo
    };

    if (type === 'video') {
      appointmentData.meetingLink = meetingLinkFromRequest || createMeetingLink();
      appointmentData.location = 'Virtual Consultation';
    } else if (type === 'in-person') {
      appointmentData.location = locationFromRequest || getDefaultLocation(doctorUser);
    } else if (locationFromRequest) {
      appointmentData.location = locationFromRequest;
    }

    const appointment = new Appointment(appointmentData);

    await appointment.save();
    await appointment.populate('patient', 'name email');
    await appointment.populate('doctor', 'name email');

    // Log payment transaction if provided
    if (transactionId && billingInfo.status === 'paid') {
      console.log(`Payment received: ${transactionId} - Amount: ${billingInfo.amount} ${billingInfo.currency}`);
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
      paymentStatus: billingInfo.status
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:appointmentId
// @desc    Update appointment
// @access  Private
router.put('/:appointmentId', auth, requireUser, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can update this appointment
    const canUpdate = req.user.role === 'doctor'
      ? appointment.doctor.toString() === req.user._id.toString()
      : appointment.patient.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow certain updates based on status
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot update completed appointment' });
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    await appointment.populate('patient', 'name email');
    await appointment.populate('doctor', 'name email');

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointments/:appointmentId/start
// @desc    Start appointment session
// @access  Private
router.post('/:appointmentId/start', auth, requireUser, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can start this appointment
    const canStart = req.user.role === 'doctor'
      ? appointment.doctor.toString() === req.user._id.toString()
      : appointment.patient.toString() === req.user._id.toString();

    if (!canStart) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Appointment cannot be started' });
    }

    appointment.status = 'in-progress';
    appointment.session = {
      ...appointment.session,
      startedAt: new Date()
    };

    await appointment.save();

    res.json({
      message: 'Appointment started successfully',
      appointment
    });
  } catch (error) {
    console.error('Start appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointments/:appointmentId/end
// @desc    End appointment session
// @access  Private
router.post('/:appointmentId/end', auth, requireUser, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can end this appointment
    const canEnd = req.user.role === 'doctor'
      ? appointment.doctor.toString() === req.user._id.toString()
      : appointment.patient.toString() === req.user._id.toString();

    if (!canEnd) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.status !== 'in-progress') {
      return res.status(400).json({ message: 'Appointment is not in progress' });
    }

    const endTime = new Date();
    const startTime = appointment.session?.startedAt || appointment.scheduledAt;
    const actualDuration = Math.round((endTime - startTime) / 60000); // in minutes

    appointment.status = 'completed';
    appointment.session = {
      ...appointment.session,
      endedAt: endTime,
      actualDuration
    };

    await appointment.save();

    res.json({
      message: 'Appointment completed successfully',
      appointment
    });
  } catch (error) {
    console.error('End appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:appointmentId
// @desc    Cancel appointment
// @access  Private
router.delete('/:appointmentId', auth, requireUser, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can cancel this appointment
    const canCancel = req.user.role === 'doctor'
      ? appointment.doctor.toString() === req.user._id.toString()
      : appointment.patient.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed appointment' });
    }

    // If payment was made, handle refund
    if (appointment.billing && appointment.billing.status === 'paid') {
      appointment.billing.status = 'cancelled';
      // In production, you would process refund here
      console.log(`Refund processed for appointment ${appointment._id}: ${appointment.billing.amount} ${appointment.billing.currency}`);
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/payments/earnings
// @desc    Get doctor's earnings from appointments
// @access  Private (Doctor only)
router.get('/payments/earnings', auth, requireDoctor, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {
      doctor: req.user._id,
      'billing.status': 'paid'
    };

    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .select('billing scheduledAt type')
      .sort({ scheduledAt: -1 });

    const totalEarnings = appointments.reduce((sum, apt) => {
      return sum + (apt.billing?.amount || 0);
    }, 0);

    const earningsByType = {
      'video': 0,
      'phone': 0
    };

    appointments.forEach(apt => {
      const type = apt.type || 'video';
      earningsByType[type] = (earningsByType[type] || 0) + (apt.billing?.amount || 0);
    });

    res.json({
      totalEarnings,
      totalAppointments: appointments.length,
      earningsByType,
      appointments: appointments.map(apt => ({
        id: apt._id,
        amount: apt.billing?.amount || 0,
        currency: apt.billing?.currency || 'USD',
        type: apt.type,
        scheduledAt: apt.scheduledAt,
        paidAt: apt.billing?.paidAt
      }))
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointments/:appointmentId/payment
// @desc    Process payment for appointment
// @access  Private
router.post('/:appointmentId/payment', auth, requireUser, [
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('amount').isNumeric().withMessage('Valid amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can pay for this appointment
    const canPay = req.user.role === 'user'
      ? appointment.patient.toString() === req.user._id.toString()
      : false;

    if (!canPay) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.billing && appointment.billing.status === 'paid') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    const { paymentMethod, amount, transactionId } = req.body;

    // Update billing information
    appointment.billing = {
      amount: amount || appointment.billing?.amount || 150,
      currency: appointment.billing?.currency || 'USD',
      status: 'paid',
      paymentMethod,
      paidAt: new Date()
    };

    await appointment.save();

    // Log payment transaction
    console.log(`Payment processed: ${transactionId || 'N/A'} - Amount: ${appointment.billing.amount} ${appointment.billing.currency} - Appointment: ${appointment._id}`);

    res.json({
      message: 'Payment processed successfully',
      appointment,
      paymentStatus: 'paid'
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
