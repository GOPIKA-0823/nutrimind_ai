const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'suggestion', 'system'],
    default: 'text'
  },
  suggestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorSuggestion',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });

// Static method to generate conversation ID
messageSchema.statics.getConversationId = function(doctorId, patientId) {
  const ids = [doctorId.toString(), patientId.toString()].sort();
  return `conv_${ids[0]}_${ids[1]}`;
};

module.exports = mongoose.model('Message', messageSchema);

