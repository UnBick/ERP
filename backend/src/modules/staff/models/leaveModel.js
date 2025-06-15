const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'staffModel'
    },
    staffModel: {
        type: String,
        required: true,
        enum: ['Staff', 'Teacher'],
        default: 'Staff'
    },
    leaveType: {
        type: String,
        required: true,
        enum: ['casual', 'sick', 'earned', 'other']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    remarks: String,
    attachments: [{
        name: String,
        path: String
    }],
    processedAt: Date,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add validation for date range
leaveSchema.pre('save', function(next) {
    if (this.startDate > this.endDate) {
        next(new Error('End date cannot be before start date'));
    }
    next();
});

module.exports = mongoose.model('StaffLeave', leaveSchema);
