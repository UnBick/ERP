const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
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
    url: {
        type: String,
        required: true
    },
    source: {
        type: String,
        enum: ['youtube', 'vimeo', 'local'],
        required: true
    },
    duration: String,
    thumbnail: String,
    tags: [String],
    viewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);