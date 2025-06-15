const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: Date
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'expired'],
        default: 'draft'
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        submittedAt: Date,
        filePath: String,
        grade: Number,
        remarks: String,
        status: {
            type: String,
            enum: ['pending', 'graded'],
            default: 'pending'
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);