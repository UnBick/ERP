const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: mongoose.Schema.Types.Mixed,
    layout: {
        type: String,
        enum: ['full-width', 'boxed', 'sidebar'],
        default: 'full-width'
    },
    visibility: {
        isPublic: {
            type: Boolean,
            default: true
        },
        requiresAuth: {
            type: Boolean,
            default: false
        }
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    media: [{
        url: String,
        type: String,
        title: String,
        alt: String,
        order: Number
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    lastUpdated: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);