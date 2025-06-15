const mongoose = require('mongoose');

// Check if model already exists to prevent duplicate registration
const Grade = mongoose.models.Grade || mongoose.model('Grade', new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    term: {
        type: String,
        enum: ['term1', 'term2', 'term3', 'final'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        enum: ['unit_test', 'mid_term', 'final', 'assessment'],
        required: true
    },
    marksObtained: {
        type: Number,
        required: true,
        min: 0
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        required: true,
        enum: ['A+', 'A', 'B+', 'B', 'C', 'F']
    },
    remarks: String,
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    teacherRemarks: String,
    classAverage: Number,
    rank: Number,
    assessmentDetails: [{
        type: {
            type: String,
            enum: ['written', 'practical', 'oral', 'project'],
            required: true
        },
        marksObtained: {
            type: Number,
            required: true
        },
        totalMarks: {
            type: Number,
            required: true
        },
        remarks: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
}));

// Indexes for better query performance
Grade.schema.index({ student: 1, subject: 1, term: 1 });
Grade.schema.index({ academicYear: 1, student: 1 });

// Virtual for calculating percentage
Grade.schema.virtual('calculatedPercentage').get(function() {
    return ((this.marksObtained / this.totalMarks) * 100).toFixed(2);
});

// Method to calculate grade based on percentage
Grade.schema.methods.calculateGrade = function() {
    const percentage = this.percentage;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
};

// Pre-save middleware to set percentage and grade
Grade.schema.pre('save', function(next) {
    if (this.isModified('marksObtained') || this.isModified('totalMarks')) {
        this.percentage = (this.marksObtained / this.totalMarks) * 100;
        this.grade = this.calculateGrade();
    }
    next();
});

// Static method to get student's term-wise performance
Grade.schema.statics.getTermPerformance = async function(studentId, term) {
    return this.aggregate([
        {
            $match: {
                student: mongoose.Types.ObjectId(studentId),
                term: term
            }
        },
        {
            $group: {
                _id: '$subject',
                averageScore: { $avg: '$percentage' },
                totalExams: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'subjects',
                localField: '_id',
                foreignField: '_id',
                as: 'subjectDetails'
            }
        }
    ]);
};

module.exports = Grade;
