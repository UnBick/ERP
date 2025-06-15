const mongoose = require('mongoose');

const homepageSchema = new mongoose.Schema({
    hero: {
        title: String,
        subtitle: String,
        backgroundType: {
            type: String,
            enum: ['image', 'video', 'slider'],
            default: 'image'
        },
        backgroundUrl: String,
        buttons: [{
            text: String,
            link: String,
            style: String
        }],
        overlay: {
            enabled: Boolean,
            color: String,
            opacity: Number
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    notices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notice'
    }],
    noticesEnabled: {
        type: Boolean,
        default: true
    },
    gallery: {
        images: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gallery'
        }],
        settings: {
            autoplay: Boolean,
            delay: Number,
            layout: String
        },
        isActive: Boolean
    },
    achievements: [{
        title: String,
        description: String,
        icon: String,
        count: Number,
        category: String
    }],
    achievementsEnabled: {
        type: Boolean,
        default: true
    },
    events: {
        enabled: Boolean,
        isActive: Boolean,
        displayCount: Number
    },
    lastUpdated: {
        hero: {
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            date: Date
        },
        notices: {
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            date: Date
        },
        gallery: {
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            date: Date
        },
        achievements: {
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            date: Date
        }
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Homepage', homepageSchema);