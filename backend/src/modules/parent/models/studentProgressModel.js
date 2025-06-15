const mongoose = require('mongoose');

const academicProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYear: String,
  semester: String,
  examResults: [{
    examName: String,
    date: Date,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    marks: Number,
    totalMarks: Number,
    grade: String,
    status: {
      type: String,
      enum: ['pending', 'published'],
      default: 'pending'
    }
  }],
  subjectPerformance: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    averageScore: Number,
    attendance: Number,
    assignments: {
      completed: Number,
      total: Number
    }
  }],
  behavioralMetrics: [{
    month: String,
    score: Number,
    remarks: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('AcademicProgress', academicProgressSchema);
