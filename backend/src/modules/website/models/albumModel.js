const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['events', 'campus', 'activities', 'achievements', 'other'],
        default: 'other'
    },
    coverImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    }],
    imageOrder: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);