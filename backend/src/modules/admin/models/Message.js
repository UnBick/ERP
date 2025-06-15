const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: String,
    enum: ['teachers', 'students', 'parents', 'all']
  }],
  channels: [{
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'portal']
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  scheduledFor: Date
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
