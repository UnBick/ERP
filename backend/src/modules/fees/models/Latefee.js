const mongoose = require('mongoose');

const lateFeeSchema = new mongoose.Schema({
    minDuration: {
        type: Number,
        required: [true, 'Minimum duration is required'],
        min: [0, 'Duration cannot be negative']
    },
    maxDuration: {
        type: Number,
        required: [true, 'Maximum duration is required'],
        validate: {
            validator: function(value) {
                return value > this.minDuration;
            },
            message: 'Maximum duration must be greater than minimum duration'
        }
    },
    penalty: {
        type: Number,
        required: [true, 'Penalty amount is required'],
        min: [0, 'Penalty amount cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add pre-save middleware for validation
lateFeeSchema.pre('save', function(next) {
    if (this.maxDuration <= this.minDuration) {
        next(new Error('Maximum duration must be greater than minimum duration'));
    }
    next();
});

module.exports = mongoose.models.LateFee || mongoose.model('LateFee', lateFeeSchema);