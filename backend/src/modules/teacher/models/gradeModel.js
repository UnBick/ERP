const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    examType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamType',
        required: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 0
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'published'],
        default: 'pending'
    },
    remarks: String,
    gradedAt: Date
}, { timestamps: true });

gradeSchema.index({ student: 1, subject: 1, examType: 1 });

const Grade = mongoose.model('Grade', gradeSchema);
module.exports = Grade;