const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    fileUrl: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    topics: [{
        title: String,
        description: String,
        duration: String,
        resources: [{
            title: String,
            url: String,
            type: String
        }]
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, { timestamps: true });

syllabusSchema.index({ class: 1, subject: 1, academicYear: 1 }, { unique: true });
module.exports = mongoose.model('Syllabus', syllabusSchema);