const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['attendance', 'performance', 'leave', 'payroll']
    },
    period: {
        type: String,
        required: true,
        enum: ['current', 'previous', 'yearly', 'custom']
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    data: mongoose.Schema.Types.Mixed,  // Fixed: Changed Schema.Types.Mixed to mongoose.Schema.Types.Mixed
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    summary: {
        totalStaff: Number,
        present: Number,
        absent: Number,
        late: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
