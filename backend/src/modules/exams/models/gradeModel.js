const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  minMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  gpaValue: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  }
}, { timestamps: true });

// Add validation for min marks < max marks
gradeSchema.pre('save', function(next) {
  if (this.minMarks >= this.maxMarks) {
    next(new Error('Minimum marks must be less than maximum marks'));
  }
  next();
});

// Ensure no overlapping ranges
gradeSchema.pre('save', async function(next) {
  const overlapping = await this.constructor.findOne({
    _id: { $ne: this._id },
    $or: [
      { minMarks: { $lte: this.maxMarks, $gte: this.minMarks } },
      { maxMarks: { $lte: this.maxMarks, $gte: this.minMarks } }
    ]
  });

  if (overlapping) {
    next(new Error('Grade range overlaps with existing grade'));
  }
  next();
});

// Change model name to ExamGrade to avoid conflicts
module.exports = mongoose.model('ExamGrade', gradeSchema);
