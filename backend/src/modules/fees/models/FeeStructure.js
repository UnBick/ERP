const mongoose = require('mongoose');

const feeAdjustmentSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['general', 'obc', 'sc', 'st'],
        required: true
    },
    type: {
        type: String,
        enum: ['percentage', 'amount'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const feeComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Component name is required']
  },
  amount: {
    type: Number,
    required: [true, 'Component amount is required'],
    min: [0, 'Amount cannot be negative']
  }
});

const feeStructureSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  baseFee: {
    type: Number,
    required: [true, 'Base fee is required'],
    min: [0, 'Base fee cannot be negative']
  },
  feeComponents: [feeComponentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FeeAdjustment', feeAdjustmentSchema);
module.exports = mongoose.models.FeeStructure || mongoose.model('FeeStructure', feeStructureSchema);