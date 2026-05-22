const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const DoctorSuggestion = require('../models/DoctorSuggestion');
const { auth, requireUser, requireDoctor } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/messages/conversation/:patientId
// @desc    Get messages between doctor and patient
// @access  Private
router.get('/conversation/:patientId', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    const patientId = req.params.patientId;

    // Verify the user has access to this conversation
    let doctorId, patientUserId;
    
    if (currentUser.role === 'doctor') {
      doctorId = currentUser._id;
      patientUserId = patientId;
      
      // Verify patient is assigned to this doctor
      const patient = await User.findById(patientUserId);
      if (!patient || patient.role !== 'user') {
        return res.status(404).json({ message: 'Patient not found' });
      }
      if (patient.profile?.doctorId?.toString() !== doctorId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      // User accessing their conversation with their doctor
      patientUserId = currentUser._id;
      doctorId = patientId;
      
      // Verify doctor is assigned to this user
      const user = await User.findById(patientUserId);
      if (!user || user.profile?.doctorId?.toString() !== doctorId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const conversationId = Message.getConversationId(doctorId, patientUserId);
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('suggestionId')
      .sort({ createdAt: 1 });

    // Mark messages as read for the current user
    await Message.updateMany(
      {
        conversationId,
        receiver: currentUser._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, [
  body('receiverId').isMongoId().withMessage('Valid receiver ID is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['text', 'suggestion', 'system']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const senderId = req.user._id;
    const { receiverId, message, type = 'text', suggestionId } = req.body;

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Verify conversation access
    if (req.user.role === 'doctor') {
      // Doctor sending to patient - verify patient is assigned
      if (receiver.role !== 'user' || receiver.profile?.doctorId?.toString() !== senderId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      // User sending to doctor - verify doctor is assigned
      if (receiver.role !== 'doctor' || req.user.profile?.doctorId?.toString() !== receiverId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const conversationId = Message.getConversationId(
      req.user.role === 'doctor' ? senderId : receiverId,
      req.user.role === 'doctor' ? receiverId : senderId
    );

    const newMessage = new Message({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      message,
      type,
      suggestionId: suggestionId || null
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('suggestionId');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let conversations = [];

    if (userRole === 'doctor') {
      // Get all patients assigned to this doctor
      const patients = await User.find({
        role: 'user',
        'profile.doctorId': userId
      }).select('_id name email');

      // Get last message for each conversation
      conversations = await Promise.all(
        patients.map(async (patient) => {
          const conversationId = Message.getConversationId(userId, patient._id);
          const lastMessage = await Message.findOne({ conversationId })
            .sort({ createdAt: -1 })
            .populate('sender', 'name');

          const unreadCount = await Message.countDocuments({
            conversationId,
            receiver: userId,
            isRead: false
          });

          return {
            participant: {
              id: patient._id,
              name: patient.name,
              email: patient.email
            },
            lastMessage: lastMessage ? {
              message: lastMessage.message,
              sender: lastMessage.sender.name,
              timestamp: lastMessage.createdAt
            } : null,
            unreadCount
          };
        })
      );
    } else {
      // Get doctor assigned to this user
      const user = await User.findById(userId).populate('profile.doctorId', 'name email');
      const doctor = user.profile?.doctorId;

      if (doctor) {
        const conversationId = Message.getConversationId(doctor._id, userId);
        const lastMessage = await Message.findOne({ conversationId })
          .sort({ createdAt: -1 })
          .populate('sender', 'name');

        const unreadCount = await Message.countDocuments({
          conversationId,
          receiver: userId,
          isRead: false
        });

        conversations = [{
          participant: {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email
          },
          lastMessage: lastMessage ? {
            message: lastMessage.message,
            sender: lastMessage.sender.name,
            timestamp: lastMessage.createdAt
          } : null,
          unreadCount
        }];
      }
    }

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/suggestion
// @desc    Send a doctor suggestion as a message
// @access  Private (Doctor only)
router.post('/suggestion', auth, requireDoctor, [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('suggestionId').isMongoId().withMessage('Valid suggestion ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doctorId = req.user._id;
    const { patientId, suggestionId } = req.body;

    // Verify suggestion exists and belongs to this doctor-patient pair
    const suggestion = await DoctorSuggestion.findById(suggestionId)
      .populate('doctor')
      .populate('patient');

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    if (suggestion.doctor._id.toString() !== doctorId.toString() ||
        suggestion.patient._id.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const conversationId = Message.getConversationId(doctorId, patientId);

    // Format suggestion as message
    const suggestionText = `📋 **Doctor's Suggestions**\n\n` +
      suggestion.suggestions.map((s, idx) => 
        `${idx + 1}. **${s.title}** (${s.category})\n   ${s.description}`
      ).join('\n\n');

    const newMessage = new Message({
      conversationId,
      sender: doctorId,
      receiver: patientId,
      message: suggestionText,
      type: 'suggestion',
      suggestionId: suggestion._id
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('suggestionId');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send suggestion message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/suggestions/:patientId
// @desc    Get doctor suggestions for a patient
// @access  Private (Doctor only)
router.get('/suggestions/:patientId', auth, requireDoctor, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.patientId;

    // Verify patient is assigned to this doctor
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    if (patient.profile?.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all suggestions for this patient
    const suggestions = await DoctorSuggestion.find({
      doctor: doctorId,
      patient: patientId
    })
      .populate('report', 'year month')
      .sort({ createdAt: -1 });

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

