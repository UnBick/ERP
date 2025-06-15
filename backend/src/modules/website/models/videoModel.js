const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    url: {
        type: String,
        required: true
    },
    thumbnailUrl: String,
    duration: String,
    type: {
        type: String,
        enum: ['youtube', 'vimeo', 'upload'],
        required: true
    },
    category: {
        type: String,
        enum: ['events', 'tutorials', 'presentations', 'other'],
        default: 'other'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    metadata: {
        size: Number,
        format: String,
        quality: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);