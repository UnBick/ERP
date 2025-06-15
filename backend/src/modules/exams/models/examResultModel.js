const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    examType: {
        type: String,
        required: true,
        enum: ['weekly', 'midSemester', 'finalSemester']
    },
    marksObtained: {
        type: Number,
        required: true,
        min: 0
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 0
    },
    grade: String,
    remarks: String,
    evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    evaluatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
examResultSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });
examResultSchema.index({ class: 1, examType: 1 });

module.exports = mongoose.model('ExamResult', examResultSchema);
