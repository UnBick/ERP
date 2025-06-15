const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    files: [{
        name: String,
        url: String,
        size: Number,
        type: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    content: {
        text: String,
        links: [String],
        attachments: [String]
    },
    submissionDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'late', 'resubmitted', 'graded', 'returned'],
        default: 'draft'
    },
    isLate: {
        type: Boolean,
        default: false
    },
    grade: {
        score: Number,
        maxScore: Number,
        percentage: Number,
        remarks: String,
        feedback: String,
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        },
        gradedAt: Date
    },
    revisions: [{
        version: Number,
        submittedAt: Date,
        files: [{
            name: String,
            url: String,
            size: Number,
            type: String
        }],
        content: {
            text: String,
            links: [String]
        },
        comments: String
    }],
    plagiarismScore: {
        percentage: Number,
        report: String,
        checkedAt: Date
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        isPrivate: Boolean
    }],
    history: [{
        action: {
            type: String,
            enum: ['created', 'submitted', 'revised', 'graded', 'returned']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for optimizing queries
assignmentSubmissionSchema.index({ student: 1, assignment: 1 }, { unique: true });
assignmentSubmissionSchema.index({ status: 1 });
assignmentSubmissionSchema.index({ submissionDate: -1 });
assignmentSubmissionSchema.index({ 'grade.gradedBy': 1 });

// Virtual field for submission status
assignmentSubmissionSchema.virtual('submissionStatus').get(function() {
    if (this.status === 'draft') return 'In Progress';
    if (this.isLate) return 'Late Submission';
    if (this.status === 'graded') return 'Graded';
    return 'Submitted';
});

// Pre-save middleware to check submission deadline
assignmentSubmissionSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('submissionDate')) {
        const Assignment = mongoose.model('Assignment');
        const assignment = await Assignment.findById(this.assignment);
        
        if (assignment && this.submissionDate > assignment.dueDate) {
            this.isLate = true;
            this.status = 'late';
        }
    }
    next();
});

// Methods
assignmentSubmissionSchema.methods = {
    async addRevision(files, content, comments) {
        const revisionCount = this.revisions.length;
        this.revisions.push({
            version: revisionCount + 1,
            submittedAt: new Date(),
            files,
            content,
            comments
        });
        this.status = 'resubmitted';
        return this.save();
    },

    async updateGrade(gradeData, teacher) {
        this.grade = {
            ...gradeData,
            gradedBy: teacher._id,
            gradedAt: new Date()
        };
        this.status = 'graded';
        return this.save();
    }
};

// Statics
assignmentSubmissionSchema.statics = {
    async getSubmissionsByAssignment(assignmentId) {
        return this.find({ assignment: assignmentId })
            .populate('student', 'name rollNo')
            .populate('grade.gradedBy', 'name')
            .sort('submissionDate');
    },

    async getStudentSubmissions(studentId) {
        return this.find({ student: studentId })
            .populate('assignment')
            .populate('grade.gradedBy', 'name')
            .sort('-submissionDate');
    }
};

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);