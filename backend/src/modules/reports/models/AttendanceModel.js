const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        required: true,
        default: 'present'
    },
    remarks: String,
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
attendanceSchema.index({ studentId: 1, date: 1 });

// For testing purposes, add mock data generation
attendanceSchema.statics.generateMockData = async function(studentId, startDate, endDate) {
    const mockData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        mockData.push({
            studentId,
            date: new Date(currentDate),
            status: Math.random() > 0.2 ? 'present' : 'absent'
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return this.insertMany(mockData);
};

const AttendanceModel = mongoose.model('Attendance', attendanceSchema);
module.exports = AttendanceModel;
