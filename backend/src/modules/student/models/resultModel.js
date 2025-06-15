const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    examination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Examination',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    marks: {
        obtained: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    },
    grade: String,
    remarks: String,
    status: {
        type: String,
        enum: ['pending', 'published', 'withheld'],
        default: 'pending'
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    gradedAt: Date,
    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedAt: Date
}, { timestamps: true });

resultSchema.index({ student: 1, examination: 1, subject: 1 }, { unique: true });
resultSchema.index({ status: 1 });
module.exports = mongoose.model('Result', resultSchema);