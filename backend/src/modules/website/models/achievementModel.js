const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['academic', 'sports', 'cultural', 'social', 'other'],
        required: true
    },
    description: String,
    date: {
        type: Date,
        required: true
    },
    level: {
        type: String,
        enum: ['school', 'district', 'state', 'national', 'international'],
        required: true
    },
    recipients: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        position: String,
        certificate: String
    }],
    competition: {
        name: String,
        organizer: String,
        venue: String
    },
    images: [String],
    document: String,
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);