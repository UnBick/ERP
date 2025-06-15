const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
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
    remarks: String
});

const examReportSchema = new mongoose.Schema({
    examName: {
        type: String,
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    date: {
        type: Date,
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
    results: [examResultSchema],
    statistics: {
        totalStudents: Number,
        passCount: Number,
        failCount: Number,
        highestMarks: Number,
        lowestMarks: Number,
        averageMarks: Number,
        gradeDistribution: {
            A: Number,
            B: Number,
            C: Number,
            D: Number,
            F: Number
        }
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exportFormat: {
        type: String,
        enum: ['csv', 'pdf', 'excel'],
        default: 'csv'
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
examReportSchema.index({ class: 1, 'reportPeriod.startDate': 1, 'reportPeriod.endDate': 1 });
examReportSchema.index({ 'results.student': 1 });

// Calculate statistics before saving
examReportSchema.pre('save', function(next) {
    if (this.isModified('results')) {
        const marks = this.results.map(r => r.marks);
        const totalStudents = this.results.length;
        
        this.statistics = {
            totalStudents,
            passCount: this.results.filter(r => r.grade !== 'F').length,
            failCount: this.results.filter(r => r.grade === 'F').length,
            highestMarks: Math.max(...marks),
            lowestMarks: Math.min(...marks),
            averageMarks: marks.reduce((a, b) => a + b, 0) / totalStudents,
            gradeDistribution: {
                A: this.results.filter(r => r.grade === 'A').length,
                B: this.results.filter(r => r.grade === 'B').length,
                C: this.results.filter(r => r.grade === 'C').length,
                D: this.results.filter(r => r.grade === 'D').length,
                F: this.results.filter(r => r.grade === 'F').length
            }
        };
    }
    next();
});

// Virtual for pass percentage
examReportSchema.virtual('passPercentage').get(function() {
    return (this.statistics.passCount / this.statistics.totalStudents) * 100;
});

const ExamReport = mongoose.model('ExamReport', examReportSchema);

module.exports = ExamReport;