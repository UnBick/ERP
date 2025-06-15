const mongoose = require('mongoose');

const feeWaiverSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    },
    amount: {
        type: Number,
        required: [true, 'Waiver amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    reason: {
        type: String,
        required: [true, 'Reason for waiver is required'],
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    semester: {
        type: String,
        required: [true, 'Semester is required']
    },
    documents: [{
        name: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    remarks: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add indexes for frequently queried fields
feeWaiverSchema.index({ student: 1, academicYear: 1 });
feeWaiverSchema.index({ status: 1 });
feeWaiverSchema.index({ createdAt: -1 });

// Check if model exists before creating
module.exports = mongoose.models.FeeWaiver || mongoose.model('FeeWaiver', feeWaiverSchema);
