const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  subject: String,
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'portal'],
    required: true
  },
  variables: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
