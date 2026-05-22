const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'phone'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // in minutes
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  location: {
    type: String
  },
  meetingLink: {
    type: String,
    required: function () {
      return this.type === 'video';
    }
  },
  agenda: [String],
  notes: String,
  preparation: {
    patientInstructions: [String],
    doctorNotes: String,
    documentsRequired: [String]
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  session: {
    startedAt: Date,
    endedAt: Date,
    actualDuration: Number, // in minutes
    chatHistory: [{
      sender: {
        type: String,
        enum: ['patient', 'doctor']
      },
      message: String,
      timestamp: Date,
      type: {
        type: String,
        enum: ['text', 'image', 'file', 'voice']
      }
    }],
    recordings: [{
      url: String,
      duration: Number,
      type: String
    }],
    sharedDocuments: [{
      name: String,
      url: String,
      uploadedBy: {
        type: String,
        enum: ['patient', 'doctor']
      },
      uploadedAt: Date
    }]
  },
  followUp: {
    required: Boolean,
    scheduledDate: Date,
    notes: String,
    actionItems: [String]
  },
  feedback: {
    patient: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      submittedAt: Date
    },
    doctor: {
      notes: String,
      recommendations: [String],
      nextAppointment: Date,
      submittedAt: Date
    }
  },
  billing: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: String,
    paidAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patient: 1, scheduledAt: -1 });
appointmentSchema.index({ doctor: 1, scheduledAt: -1 });
appointmentSchema.index({ status: 1, scheduledAt: 1 });

// Virtual for appointment status
appointmentSchema.virtual('isUpcoming').get(function () {
  return this.scheduledAt > new Date() && this.status === 'scheduled';
});

appointmentSchema.virtual('isPast').get(function () {
  return this.scheduledAt < new Date() || this.status === 'completed';
});

// Pre-save middleware to validate appointment time
appointmentSchema.pre('save', function (next) {
  if (this.scheduledAt < new Date()) {
    return next(new Error('Cannot schedule appointment in the past'));
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
