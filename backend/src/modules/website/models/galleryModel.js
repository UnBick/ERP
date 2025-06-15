const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
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
    type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    thumbnailUrl: String,
    category: {
        type: String,
        enum: ['events', 'campus', 'activities', 'achievements', 'other'],
        default: 'other'
    },
    tags: [String],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    order: Number,
    metadata: {
        size: Number,
        dimensions: {
            width: Number,
            height: Number
        },
        format: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);