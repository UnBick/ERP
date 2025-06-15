const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
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
    department: {  // Add department field to schema
        type: String,
        required: true,
        trim: true
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
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Normalize the date by removing time component
staffAttendanceSchema.pre('save', function(next) {
    if (this.date) {
        this.date.setHours(0, 0, 0, 0);
    }
    next();
});

// Create compound index for unique attendance per staff per day
staffAttendanceSchema.index(
    { staffId: 1, date: 1 },
    { unique: true }
);

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
