const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    remarks: String
}, { 
    timestamps: true 
});

// Compound index to prevent duplicate attendance records
studentAttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Index for querying by section and date
studentAttendanceSchema.index({ section: 1, date: 1 });

// Check if model exists before creating
const StudentAttendance = mongoose.models.StudentAttendance || mongoose.model('StudentAttendance', studentAttendanceSchema);

module.exports = StudentAttendance;