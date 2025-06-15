const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    remarks: String,
    isPublished: {
        type: Boolean,
        default: false
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    submittedAt: Date,
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    modifiedAt: Date
}, {
    timestamps: true
});

// Indexes
gradeSchema.index({ student: 1, exam: 1, subject: 1 }, { unique: true });
gradeSchema.index({ exam: 1, subject: 1 });
gradeSchema.index({ isPublished: 1 });

// Export the model if it doesn't exist, otherwise use the existing model
module.exports = mongoose.models.Grade || mongoose.model('Grade', gradeSchema);
