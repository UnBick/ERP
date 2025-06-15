const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    duration: Number,
    resources: [{
        type: String,
        url: String
    }],
    completed: {
        type: Boolean,
        default: false
    }
});

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    topics: [topicSchema],
    completed: {
        type: Boolean,
        default: false
    }
});

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
    chapters: [chapterSchema],
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'published'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PredefinedSyllabus', syllabusSchema);