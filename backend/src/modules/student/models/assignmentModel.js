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
    fileUrl: String,
    comment: String,
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['submitted', 'resubmitted', 'late', 'graded'],
        default: 'submitted'
    },
    grade: {
        marks: Number,
        feedback: String,
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        },
        gradedAt: Date
    }
}, { timestamps: true });

// Indexes
assignmentSubmissionSchema.index({ student: 1, assignment: 1 }, { unique: true });
assignmentSubmissionSchema.index({ status: 1 });

// Check if the model already exists before creating it
module.exports = mongoose.models.AssignmentSubmission || mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
