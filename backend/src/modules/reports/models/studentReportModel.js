const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    examName: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    }
});

const studentReportSchema = new mongoose.Schema({
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
    examResults: [examResultSchema],
    attendance: {
        totalDays: Number,
        present: Number,
        absent: Number,
        percentage: Number
    },
    performance: {
        averageMarks: Number,
        highestMarks: Number,
        lowestMarks: Number,
        rank: Number
    },
    remarks: String,
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exportFormat: {
        type: String,
        enum: ['pdf', 'csv', 'excel'],
        default: 'csv'
    },
    fileUrl: String,
    status: {
        type: String,
        enum: ['draft', 'generated', 'approved'],
        default: 'draft'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
studentReportSchema.index({ student: 1, class: 1 });
studentReportSchema.index({ 'reportPeriod.startDate': 1, 'reportPeriod.endDate': 1 });

// Calculate performance metrics before saving
studentReportSchema.pre('save', function(next) {
    if (this.isModified('examResults')) {
        const marks = this.examResults.map(result => result.marks);
        this.performance = {
            averageMarks: marks.reduce((a, b) => a + b, 0) / marks.length,
            highestMarks: Math.max(...marks),
            lowestMarks: Math.min(...marks)
        };
    }
    next();
});

// Virtual for student full name
studentReportSchema.virtual('studentName').get(function() {
    return this.student ? `${this.student.firstName} ${this.student.lastName}` : '';
});

// Virtual for class name
studentReportSchema.virtual('className').get(function() {
    return this.class ? this.class.name : '';
});

// Method to generate CSV data
studentReportSchema.methods.toCSV = function() {
    return {
        'Student Name': this.studentName,
        'Class': this.className,
        'Average Marks': this.performance.averageMarks,
        'Attendance %': this.attendance.percentage,
        'Remarks': this.remarks
    };
};

const StudentReport = mongoose.model('StudentReport', studentReportSchema);

module.exports = StudentReport;