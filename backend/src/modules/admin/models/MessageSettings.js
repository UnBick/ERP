const mongoose = require('mongoose');

const messageSettingsSchema = new mongoose.Schema({
  emailEnabled: {
    type: Boolean,
    default: true
  },
  smsEnabled: {
    type: Boolean,
    default: false
  },
  whatsappEnabled: {
    type: Boolean,
    default: false
  },
  autoRespond: {
    type: Boolean,
    default: false
  },
  dailyLimit: {
    type: Number,
    default: 1000
  },
  defaultLanguage: {
    type: String,
    default: 'english'
  }
}, { timestamps: true });

module.exports = mongoose.model('MessageSettings', messageSettingsSchema);
