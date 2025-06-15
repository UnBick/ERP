const mongoose = require('mongoose');

const attendanceSummarySchema = new mongoose.Schema({
    present: {
        count: Number,
        percentage: Number
    },
    absent: {
        count: Number,
        percentage: Number
    },
    late: {
        count: Number,
        percentage: Number
    },
    totalDays: Number,
    averageAttendance: Number
});

const sectionWiseSchema = new mongoose.Schema({
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    summary: attendanceSummarySchema
});

const attendanceReportSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    reportPeriod: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    scope: {
        type: String,
        enum: ['class', 'section', 'individual'],
        default: 'class'
    },
    data: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        date: Date,
        status: {
            type: String,
            enum: ['present', 'absent', 'late'],
            required: true
        },
        remarks: String
    }],
    summary: attendanceSummarySchema,
    sectionWiseComparison: [sectionWiseSchema],
    visualizationType: {
        type: String,
        enum: ['table', 'bar', 'pie'],
        default: 'table'
    },
    exportFormat: {
        type: String,
        enum: ['csv', 'pdf', 'excel'],
        default: 'csv'
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileUrl: String,
    status: {
        type: String,
        enum: ['draft', 'generated', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
attendanceReportSchema.index({ class: 1, 'reportPeriod.startDate': 1, 'reportPeriod.endDate': 1 });
attendanceReportSchema.index({ 'data.student': 1, 'data.date': 1 });

// Method to calculate summary
attendanceReportSchema.methods.calculateSummary = function() {
    const totalRecords = this.data.length;
    const present = this.data.filter(d => d.status === 'present').length;
    const absent = this.data.filter(d => d.status === 'absent').length;
    const late = this.data.filter(d => d.status === 'late').length;

    this.summary = {
        present: {
            count: present,
            percentage: (present / totalRecords) * 100
        },
        absent: {
            count: absent,
            percentage: (absent / totalRecords) * 100
        },
        late: {
            count: late,
            percentage: (late / totalRecords) * 100
        },
        totalDays: totalRecords,
        averageAttendance: (present / totalRecords) * 100
    };
};

// Pre-save middleware to calculate summary
attendanceReportSchema.pre('save', function(next) {
    if (this.isModified('data')) {
        this.calculateSummary();
    }
    next();
});

const AttendanceReport = mongoose.model('AttendanceReport', attendanceReportSchema);

module.exports = AttendanceReport;