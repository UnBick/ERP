const mongoose = require('mongoose');

const aiContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['questions', 'assignment', 'quiz'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
aiContentSchema.index({ type: 1, generatedBy: 1, createdAt: -1 });

module.exports = mongoose.model('AIContent', aiContentSchema);
