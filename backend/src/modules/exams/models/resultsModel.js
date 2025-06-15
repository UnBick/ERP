const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    examSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade'
    },
    remarks: String,
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    }
}, { timestamps: true });

// Use existing model if available, otherwise compile a new one.
module.exports = mongoose.models.Marks || mongoose.model('Marks', marksSchema);
