const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date,
        required: function() {
            return this.status === 'present'; // Only required for present status
        }
    },
    checkOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'leave'],
        default: 'present'
    },
    // Add fields for leave
    leaveType: {
        type: String,
        enum: ['sick', 'casual', 'emergency'],
        required: function() {
            return this.status === 'leave';
        }
    },
    endDate: {
        type: Date,
        required: function() {
            return this.status === 'leave';
        }
    },
    reason: {
        type: String,
        required: function() {
            return this.status === 'leave';
        }
    },
    location: {
        lat: Number,
        lng: Number
    },
    remarks: String
}, {
    timestamps: true
});

// Indexes for faster queries
teacherAttendanceSchema.index({ teacher: 1, date: 1 });
teacherAttendanceSchema.index({ date: 1 });
teacherAttendanceSchema.index({ status: 1 });

const TeacherAttendance = mongoose.model('TeacherAttendance', teacherAttendanceSchema);
module.exports = TeacherAttendance;