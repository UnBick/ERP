const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  examType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamType',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
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
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamGrade'
  },
  remarks: String,
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Published'],
    default: 'Draft'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: Date,
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  modifiedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);