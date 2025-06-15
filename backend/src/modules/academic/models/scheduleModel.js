const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  room: String,
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
