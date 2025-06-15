const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['REPORT_CARD', 'PROGRESS_REPORT', 'ATTENDANCE_REPORT', 'BEHAVIOR_REPORT'],
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    period: {
        start: Date,
        end: Date
    },
    data: mongoose.Schema.Types.Mixed,
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template'
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'generated', 'approved', 'published', 'archived'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    shareHistory: [{
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        shareDate: Date
    }]
}, { timestamps: true });

reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ class: 1, section: 1 });
reportSchema.index({ generatedDate: -1 });
module.exports = mongoose.model('Report', reportSchema);