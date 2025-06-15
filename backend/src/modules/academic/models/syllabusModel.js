const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived'],
        default: 'Draft'
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }
}, {
    timestamps: true
});

// Compound index for unique syllabus per class-subject combination
syllabusSchema.index({ classId: 1, subjectId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);